# HustleBridge Chat — QA Testing Checklist

**Base URL:** `http://localhost:4000/api/v1`  
**Socket URL:** `http://localhost:4000`  
**Demo accounts (after `npm run db:seed`):**

| Role    | Email                      | Password  |
|---------|----------------------------|-----------|
| Student | arjun@hustlebridge.dev     | Password1 |
| Client  | techlearn@hustlebridge.dev | Password1 |

---

## Prerequisites

| # | Step | Pass criteria |
|---|------|---------------|
| P1 | PostgreSQL running, `.env` configured | `npm run db:migrate` succeeds |
| P2 | Seed data loaded | `npm run db:seed` succeeds |
| P3 | API server running | `GET /api/v1/health` returns `status: healthy` |
| P4 | PowerShell 5.1+ or PowerShell 7 | `$PSVersionTable.PSVersion` |

```powershell
cd backend
npm run db:migrate
npm run db:seed
npm run dev
```

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/v1/health"
```

**Quick smoke (all REST):**

```powershell
cd backend
.\scripts\test-messages.ps1
```

**Socket smoke:**

```powershell
cd backend
node scripts/test-chat-socket.mjs
```

---

## Shared setup (run once per session)

```powershell
$BaseUrl = "http://localhost:4000/api/v1"

function Invoke-Api {
  param([string]$Method, [string]$Path, [hashtable]$Body = $null, [string]$Token = $null)
  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  $params = @{ Method = $Method; Uri = "$BaseUrl$Path"; Headers = $headers; ErrorAction = "Stop" }
  if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 10) }
  Invoke-RestMethod @params
}

$student = Invoke-Api -Method POST -Path "/auth/login" -Body @{
  email    = "arjun@hustlebridge.dev"
  password = "Password1"
}
$client = Invoke-Api -Method POST -Path "/auth/login" -Body @{
  email    = "techlearn@hustlebridge.dev"
  password = "Password1"
}

$StudentToken = $student.data.tokens.accessToken
$ClientToken  = $client.data.tokens.accessToken
$StudentId    = $student.data.user.id
$ClientId     = $client.data.user.id

Write-Host "Student: $StudentId"
Write-Host "Client:  $ClientId"
```

---

## 1. Create conversation

**Endpoint:** `POST /api/v1/messages/conversations`

| ID | Test case | Steps | Expected result | Pass |
|----|-----------|-------|-----------------|------|
| C1 | Student creates conversation with client | POST with `participantId` + `initialMessage` | `201`, `data.conversation.id` present, initial message in `data.messages` | ☐ |
| C2 | Duplicate conversation returns existing | Repeat C1 with same `participantId` | Same `conversation.id`, no duplicate row | ☐ |
| C3 | Create without initial message | POST with only `participantId` | `201`, empty or prior messages only | ☐ |
| C4 | With `opportunityId` | POST with valid opportunity UUID | `data.conversation.opportunityId` set | ☐ |
| C5 | Same role rejected | Two students attempt conversation | `400`, student-client only error | ☐ |
| C6 | Self-conversation rejected | `participantId` = own user id | `400` | ☐ |
| C7 | Non-participant cannot access | Third user GET thread | `403` or `404` | ☐ |
| C8 | Missing auth | POST without token | `401` | ☐ |

```powershell
# C1 — Create conversation (student → client)
$created = Invoke-Api -Method POST -Path "/messages/conversations" -Token $StudentToken -Body @{
  participantId  = $ClientId
  initialMessage = "QA test: new conversation"
}
$created | ConvertTo-Json -Depth 8
$ConversationId = $created.data.conversation.id

# C2 — Duplicate (should return same conversation)
Invoke-Api -Method POST -Path "/messages/conversations" -Token $StudentToken -Body @{
  participantId  = $ClientId
  initialMessage = "Second attempt"
} | ConvertTo-Json -Depth 8

# C3 — No initial message
Invoke-Api -Method POST -Path "/messages/conversations" -Token $StudentToken -Body @{
  participantId = $ClientId
} | ConvertTo-Json -Depth 8

# C6 — Self conversation (expect error)
try {
  Invoke-Api -Method POST -Path "/messages/conversations" -Token $StudentToken -Body @{
    participantId = $StudentId
  }
} catch { $_.Exception.Message }
```

**List conversations:** `GET /api/v1/messages/conversations`

```powershell
Invoke-Api -Method GET -Path "/messages/conversations" -Token $StudentToken | ConvertTo-Json -Depth 8
```

---

## 2. Send message

**Endpoint:** `POST /api/v1/messages/conversations/:conversationId/messages`

| ID | Test case | Steps | Expected result | Pass |
|----|-----------|-------|-----------------|------|
| M1 | Client sends message in thread | POST `content` as client | `201`, message `id`, `senderId` = client | ☐ |
| M2 | Student sends reply | POST as student | `201`, correct `conversationId` | ☐ |
| M3 | Empty content rejected | POST `content: ""` | `400` validation error | ☐ |
| M4 | Non-participant cannot send | Third user POST | `403` or `404` | ☐ |
| M5 | `lastMessage` updates on list | GET conversations after send | Latest content in `lastMessage` | ☐ |
| M6 | Invalid conversation UUID | POST to fake id | `404` or validation error | ☐ |

```powershell
# M1 — Client sends message
$sent = Invoke-Api -Method POST -Path "/messages/conversations/$ConversationId/messages" -Token $ClientToken -Body @{
  content = "QA: client reply via REST"
}
$sent | ConvertTo-Json -Depth 8

# M2 — Student reply
Invoke-Api -Method POST -Path "/messages/conversations/$ConversationId/messages" -Token $StudentToken -Body @{
  content = "QA: student reply via REST"
} | ConvertTo-Json -Depth 8

# M3 — Empty content (expect error)
try {
  Invoke-Api -Method POST -Path "/messages/conversations/$ConversationId/messages" -Token $StudentToken -Body @{
    content = ""
  }
} catch { $_.Exception.Message }
```

---

## 3. Message history

**Endpoint:** `GET /api/v1/messages/conversations/:conversationId`

| ID | Test case | Steps | Expected result | Pass |
|----|-----------|-------|-----------------|------|
| H1 | Full thread loads | GET thread after M1–M2 | All messages in `data.messages`, ordered by time | ☐ |
| H2 | Pagination | `?page=1&limit=2` then `page=2` | `meta.total`, `meta.hasNextPage` correct | ☐ |
| H3 | Participant info present | GET thread | `data.conversation.participants` with names/roles | ☐ |
| H4 | GET marks read for caller | GET as student, check unread | Student `unreadCount` → 0 after GET | ☐ |
| H5 | Non-participant denied | Third user GET | `403` or `404` | ☐ |

```powershell
# H1 — Full history
$thread = Invoke-Api -Method GET -Path "/messages/conversations/$ConversationId" -Token $StudentToken
$thread.data.messages | ForEach-Object { "$($_.createdAt) [$($_.senderId)] $($_.content)" }

# H2 — Pagination
Invoke-Api -Method GET -Path "/messages/conversations/$ConversationId?page=1&limit=2" -Token $StudentToken | ConvertTo-Json -Depth 6
Invoke-Api -Method GET -Path "/messages/conversations/$ConversationId?page=2&limit=2" -Token $StudentToken | ConvertTo-Json -Depth 6
```

---

## 4. Read receipts

**Endpoints:**
- `PATCH /api/v1/messages/conversations/:conversationId/read`
- Socket: `message_read` (client → server and server → room)

| ID | Test case | Steps | Expected result | Pass |
|----|-----------|-------|-----------------|------|
| R1 | PATCH mark read | Client sends, student PATCH read | `data.read: true`, `readAt` ISO timestamp | ☐ |
| R2 | `lastReadAt` on participant | GET thread after R1 | Client `participants[].lastReadAt` updated for student | ☐ |
| R3 | Unread count decreases | List conversations after read | `unreadCount` = 0 for reader | ☐ |
| R4 | Socket `message_read` emitted | Run socket script / browser | Partner receives `message_read` event | ☐ |
| R5 | Non-participant PATCH denied | Third user PATCH | `403` | ☐ |

```powershell
# R1 — Mark read (student)
Invoke-Api -Method PATCH -Path "/messages/conversations/$ConversationId/read" -Token $StudentToken | ConvertTo-Json -Depth 4

# R2 — Verify lastReadAt on participants
$afterRead = Invoke-Api -Method GET -Path "/messages/conversations/$ConversationId" -Token $ClientToken
$afterRead.data.conversation.participants | ConvertTo-Json -Depth 4

# R3 — Unread count on list
Invoke-Api -Method GET -Path "/messages/conversations" -Token $StudentToken | ConvertTo-Json -Depth 6
```

**Socket verification:**

```powershell
node scripts/test-chat-socket.mjs --scenario read-receipt
```

---

## 5. Online status

**Socket events:** `user_online`, `user_offline`  
**REST hint:** `participants[].isOnline` on conversation payloads

| ID | Test case | Steps | Expected result | Pass |
|----|-----------|-------|-----------------|------|
| O1 | Partner sees user online | Client socket connected, student connects | Client receives `user_online` with student `userId` | ☐ |
| O2 | `isOnline` true in REST | Student connected, client GET thread | Student participant `isOnline: true` | ☐ |
| O3 | User goes offline | Student disconnects all sockets | Client receives `user_offline` | ☐ |
| O4 | `isOnline` false after disconnect | Client GET thread | Student `isOnline: false` | ☐ |
| O5 | Multi-tab stays online | Two tabs same user, close one | Partner still sees online until last tab closes | ☐ |

```powershell
# O1–O4 — Automated socket presence test
node scripts/test-chat-socket.mjs --scenario presence

# O2 — REST isOnline (run while socket script holds student online)
Invoke-Api -Method GET -Path "/messages/conversations/$ConversationId" -Token $ClientToken |
  Select-Object -ExpandProperty data |
  Select-Object -ExpandProperty conversation |
  Select-Object -ExpandProperty participants |
  ConvertTo-Json -Depth 4
```

---

## 6. Offline notifications

**Endpoints:**
- `GET /api/v1/notifications`
- Socket: `notification:new` (when recipient offline)

| ID | Test case | Steps | Expected result | Pass |
|----|-----------|-------|-----------------|------|
| N1 | Message while offline creates notification | Client **not** connected; student sends REST message | Client `GET /notifications` has `type: message` | ☐ |
| N2 | Notification payload | Inspect notification `data` | Contains `conversationId`, `messageId` | ☐ |
| N3 | Online user skips DB notification | Client socket connected; student sends | No new notification row (or count unchanged) | ☐ |
| N4 | New conversation offline | Client offline; student creates conversation | Notification with `New conversation` title | ☐ |
| N5 | Mark notification read | `PATCH /notifications/:id/read` | `isRead: true` | ☐ |

```powershell
# N1 — Send while client offline (ensure no client socket running)
Invoke-Api -Method POST -Path "/messages/conversations/$ConversationId/messages" -Token $StudentToken -Body @{
  content = "QA: message while client offline"
} | ConvertTo-Json -Depth 4

# N1 — Check client notifications
$notifs = Invoke-Api -Method GET -Path "/notifications" -Token $ClientToken
$notifs.data.notifications | Where-Object { $_.type -eq "message" } | ConvertTo-Json -Depth 6

# N5 — Mark first unread read
$unread = ($notifs.data.notifications | Where-Object { -not $_.isRead } | Select-Object -First 1)
if ($unread) {
  Invoke-Api -Method PATCH -Path "/notifications/$($unread.id)/read" -Token $ClientToken | ConvertTo-Json -Depth 4
}
```

**Socket offline notification test:**

```powershell
node scripts/test-chat-socket.mjs --scenario offline-notification
```

---

## 7. Socket.IO events

| Event | Direction | Payload | Test ID |
|-------|-----------|---------|---------|
| `connection` | server | (implicit) | S1 |
| `join_conversation` | client → server | `conversationId` | S2 |
| `send_message` | client → server | `{ conversationId, content }` | S3 |
| `receive_message` | server → client | message object | S4 |
| `typing_start` | both | `{ conversationId, userId }` | S5 |
| `typing_stop` | both | `{ conversationId, userId }` | S6 |
| `message_read` | both | `{ conversationId, userId, readAt }` | S7 |
| `user_online` | server → client | `{ userId }` | S8 |
| `user_offline` | server → client | `{ userId }` | S9 |
| `notification:new` | server → client | notification row | S10 |

| ID | Test case | Expected result | Pass |
|----|-----------|-----------------|------|
| S1 | Connect with valid JWT | Socket connects, no error | ☐ |
| S2 | Connect without token | Connection rejected | ☐ |
| S3 | `join_conversation` non-participant | Callback `success: false` | ☐ |
| S4 | `send_message` → `receive_message` | Both parties in room receive payload | ☐ |
| S5 | `typing_start` / `typing_stop` | Partner receives typing events | ☐ |
| S6 | Invalid `send_message` (no content) | Callback `success: false` | ☐ |

```powershell
# Full socket event suite
node scripts/test-chat-socket.mjs --scenario all
```

**Manual browser check (optional):**

```javascript
// DevTools console on frontend (with valid token)
const socket = io('http://localhost:4000', { auth: { token: '<ACCESS_TOKEN>' } });
socket.on('connect', () => console.log('connected', socket.id));
socket.on('receive_message', console.log);
socket.emit('join_conversation', '<CONVERSATION_ID>', console.log);
socket.emit('send_message', { conversationId: '<ID>', content: 'socket test' }, console.log);
```

---

## 8. Multi-user communication

| ID | Test case | Steps | Expected result | Pass |
|----|-----------|-------|-----------------|------|
| U1 | Bidirectional REST chat | Student ↔ client multiple messages | Both see full history | ☐ |
| U2 | Bidirectional socket chat | Both in room, socket send both ways | Real-time delivery both directions | ☐ |
| U3 | REST + socket mixed | One REST, one socket | Both appear in history | ☐ |
| U4 | Concurrent sends | Both send within 1s | No lost messages, correct order | ☐ |
| U5 | Two conversations | Student chats two different clients | Threads isolated | ☐ |
| U6 | Read state per user | Client reads; student still has unread | Per-user `unreadCount` | ☐ |

```powershell
# U1 — Bidirectional REST
Invoke-Api -Method POST -Path "/messages/conversations/$ConversationId/messages" -Token $StudentToken -Body @{ content = "Student msg 1" }
Invoke-Api -Method POST -Path "/messages/conversations/$ConversationId/messages" -Token $ClientToken -Body @{ content = "Client msg 1" }
Invoke-Api -Method POST -Path "/messages/conversations/$ConversationId/messages" -Token $StudentToken -Body @{ content = "Student msg 2" }
Invoke-Api -Method GET -Path "/messages/conversations/$ConversationId" -Token $ClientToken |
  Select-Object -ExpandProperty data |
  Select-Object -ExpandProperty messages |
  ForEach-Object { $_.content }

# U2–U4 — Multi-user socket
node scripts/test-chat-socket.mjs --scenario multi-user
```

---

## API reference (quick)

| Feature | Method | Path |
|---------|--------|------|
| Health | GET | `/api/v1/health` |
| Login | POST | `/api/v1/auth/login` |
| List conversations | GET | `/api/v1/messages/conversations` |
| Create conversation | POST | `/api/v1/messages/conversations` |
| Thread + history | GET | `/api/v1/messages/conversations/:conversationId` |
| Send message | POST | `/api/v1/messages/conversations/:conversationId/messages` |
| Mark read | PATCH | `/api/v1/messages/conversations/:conversationId/read` |
| List notifications | GET | `/api/v1/notifications` |
| Mark notification read | PATCH | `/api/v1/notifications/:id/read` |

---

## Sign-off

| Area | Tester | Date | Result |
|------|--------|------|--------|
| Create conversation | | | |
| Send message | | | |
| Message history | | | |
| Read receipts | | | |
| Online status | | | |
| Offline notifications | | | |
| Socket.IO events | | | |
| Multi-user | | | |

**Overall release recommendation:** ☐ Pass · ☐ Fail · ☐ Pass with notes
