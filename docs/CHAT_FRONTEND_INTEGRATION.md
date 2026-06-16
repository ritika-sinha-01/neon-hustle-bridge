# React + Vite Chat Integration Plan

Minimal steps to wire the existing `src/routes/messages.tsx` UI to the HustleBridge messaging backend.

## 1. Dependencies

```bash
npm install socket.io-client
```

## 2. API client (`src/lib/messagesApi.ts`)

```typescript
const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "Request failed");
  return json.data as T;
}

export const listConversations = () => api("/messages/conversations");
export const getConversation = (id: string) => api(`/messages/conversations/${id}`);
export const createConversation = (body: {
  participantId: string;
  opportunityId?: string;
  initialMessage?: string;
}) => api("/messages/conversations", { method: "POST", body: JSON.stringify(body) });
export const sendMessageRest = (conversationId: string, content: string) =>
  api(`/messages/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
export const markRead = (conversationId: string) =>
  api(`/messages/conversations/${conversationId}/read`, { method: "PATCH" });
```

## 3. Socket hook (`src/hooks/useChatSocket.ts`)

```typescript
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

export function useChatSocket(token: string | null, handlers: {
  onReceiveMessage?: (msg: unknown) => void;
  onMessageRead?: (payload: unknown) => void;
  onTypingStart?: (payload: unknown) => void;
  onTypingStop?: (payload: unknown) => void;
  onUserOnline?: (payload: { userId: string }) => void;
  onUserOffline?: (payload: { userId: string }) => void;
}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("receive_message", (payload) => handlers.onReceiveMessage?.(payload));
    socket.on("message_read", (payload) => handlers.onMessageRead?.(payload));
    socket.on("typing_start", (payload) => handlers.onTypingStart?.(payload));
    socket.on("typing_stop", (payload) => handlers.onTypingStop?.(payload));
    socket.on("user_online", (payload) => handlers.onUserOnline?.(payload));
    socket.on("user_offline", (payload) => handlers.onUserOffline?.(payload));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return {
    joinConversation: (conversationId: string) =>
      socketRef.current?.emit("join_conversation", conversationId),
    sendMessage: (conversationId: string, content: string) =>
      socketRef.current?.emit("send_message", { conversationId, content }),
    markRead: (conversationId: string) =>
      socketRef.current?.emit("message_read", { conversationId }),
    typingStart: (conversationId: string) =>
      socketRef.current?.emit("typing_start", { conversationId }),
    typingStop: (conversationId: string) =>
      socketRef.current?.emit("typing_stop", { conversationId }),
  };
}
```

## 4. Messages page flow

| UI area | Data source |
|---------|-------------|
| Conversation list | `GET /messages/conversations` on mount |
| Active thread messages | `GET /messages/conversations/:id` when selecting a conversation |
| Send message | Prefer `send_message` socket event; fall back to REST if socket disconnected |
| Read receipts | `participants[].lastReadAt` from conversation payload + `message_read` socket event |
| Online badge | `participants[].isOnline` + `user_online` / `user_offline` events |
| Typing indicator | `typing_start` / `typing_stop` with 2s debounce on input |
| Offline notifications | Existing notifications page via `GET /notifications` |

## 5. Suggested component state

```typescript
type ChatState = {
  conversations: Conversation[];
  activeId: string | null;
  messages: Message[];
  typingUserIds: Set<string>;
  onlineUserIds: Set<string>;
};
```

On `receive_message`: append to `messages` if `activeId` matches; bump `lastMessage` in list; if sender is not self, call `markRead`.

On conversation select: `joinConversation(id)`, fetch thread, update `onlineUserIds` from `participants.isOnline`.

## 6. Env vars (`.env`)

```
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

## 7. Entry points from other features

- **Application detail (client)**: `createConversation({ participantId: studentId, opportunityId })`
- **Opportunity detail (student)**: `createConversation({ participantId: clientId, opportunityId })`

Role enforcement on the backend ensures only student ↔ client pairs can chat.

## 8. Testing checklist

1. Run `backend/scripts/test-messages.ps1` for REST smoke tests.
2. Open two browser sessions (student + client), connect sockets, send messages in real time.
3. Close one tab → partner sees `user_offline`; reopen → `user_online`.
4. Send while partner offline → notification row appears in `GET /notifications`.
