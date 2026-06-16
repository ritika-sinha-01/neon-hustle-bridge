# HustleBridge API

Production-grade REST API for the HustleBridge marketplace — connecting students (hustlers) with client opportunities.

## Stack

- **Node.js** + **Express 5**
- **PostgreSQL** (connection pooling via `pg`)
- **JWT** access + refresh tokens
- **Socket.IO** for real-time messaging and notifications

## Architecture

```
backend/src/
├── config/          # Environment & database pool
├── controllers/     # HTTP request handlers (thin)
├── db/
│   ├── migrations/  # SQL schema migrations
│   ├── migrate.js
│   └── seed.js
├── middleware/      # Auth, validation, errors, rate limiting
├── models/          # Data access layer (repositories)
├── routes/          # REST route definitions
├── services/        # Business logic
├── sockets/         # Socket.IO handlers
├── utils/           # JWT, errors, helpers
├── validators/      # express-validator schemas
├── app.js           # Express app factory
└── server.js        # HTTP + Socket.IO bootstrap
```

Follows **MVC**: Routes → Controllers → Services → Models.

## Quick start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 2. Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

npm install
npm run db:migrate
npm run db:seed   # optional demo data
npm run dev
```

API base URL: `http://localhost:4000/api/v1`

### 3. Demo accounts (after seed)

| Role    | Email                      | Password  |
|---------|----------------------------|-----------|
| Student | arjun@hustlebridge.dev     | Password1 |
| Client  | techlearn@hustlebridge.dev | Password1 |

## API endpoints

### Authentication — `/api/v1/auth`

| Method | Path       | Auth | Description              |
|--------|------------|------|--------------------------|
| POST   | /register  | —    | Register student/client  |
| POST   | /login     | —    | Login                    |
| POST   | /refresh   | —    | Rotate refresh token     |
| POST   | /logout    | —    | Revoke refresh token     |
| GET    | /me        | ✓    | Current user + profile   |

### Students — `/api/v1/students`

| Method | Path        | Auth     | Description           |
|--------|-------------|----------|-----------------------|
| GET    | /profile    | student  | Own profile           |
| PUT    | /profile    | student  | Update profile        |
| GET    | /dashboard  | student  | Dashboard stats       |
| GET    | /recommended| student  | Matched opportunities |

Public profile: `GET /api/v1/students/public/:id`

### Clients — `/api/v1/clients`

| Method | Path         | Auth   | Description        |
|--------|--------------|--------|--------------------|
| GET    | /profile     | client | Own profile        |
| PUT    | /profile     | client | Update profile     |
| GET    | /dashboard   | client | Dashboard stats    |
| GET    | /applicants  | client | All applicants     |

### Opportunities — `/api/v1/opportunities`

| Method | Path              | Auth          | Description              |
|--------|-------------------|---------------|--------------------------|
| GET    | /                 | optional      | List (filters, paginate) |
| GET    | /:id              | optional      | Get by ID              |
| POST   | /                 | client        | Create opportunity       |
| PUT    | /:id              | client        | Update own opportunity   |
| DELETE | /:id              | client        | Delete own opportunity   |
| GET    | /:id/applications | client        | List applications        |

Query params for list: `page`, `limit`, `category`, `workMode`, `status`, `search`, `minBudget`, `maxBudget`, `mine=true` (client).

### Applications — `/api/v1/applications`

| Method | Path          | Auth              | Description           |
|--------|---------------|-------------------|-----------------------|
| POST   | /             | student           | Apply to opportunity  |
| GET    | /             | student           | My applications       |
| GET    | /stats        | student           | Application counts    |
| GET    | /:id          | student or owner  | Application detail    |
| PATCH  | /:id/status   | student or client | Update status         |

### Messaging — `/api/v1/messages`

| Method | Path                          | Auth | Description           |
|--------|-------------------------------|------|-----------------------|
| GET    | /conversations                | ✓    | List conversations    |
| POST   | /conversations                | ✓    | Start conversation    |
| GET    | /conversations/:conversationId            | ✓    | Messages in thread    |
| POST   | /conversations/:conversationId/messages   | ✓    | Send message (REST)   |
| PATCH  | /conversations/:conversationId/read       | ✓    | Mark as read          |

### Notifications — `/api/v1/notifications`

| Method | Path        | Auth | Description        |
|--------|-------------|------|--------------------|
| GET    | /           | ✓    | List notifications |
| PATCH  | /read-all   | ✓    | Mark all read      |
| PATCH  | /:id/read   | ✓    | Mark one read      |
| DELETE | /:id        | ✓    | Delete notification|

## Response format

**Success:**

```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

## Socket.IO

Connect with JWT in handshake:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: { token: accessToken },
});
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | server | Authenticated socket connected |
| `join_conversation` | client → server | Join a conversation room (participant only) |
| `send_message` | client → server | Send message `{ conversationId, content }` |
| `receive_message` | server → client | New message broadcast |
| `typing_start` | both | `{ conversationId, userId }` |
| `typing_stop` | both | `{ conversationId, userId }` |
| `message_read` | both | Read receipt `{ conversationId, userId, readAt }` |
| `user_online` | server → client | `{ userId }` — conversation partner came online |
| `user_offline` | server → client | `{ userId }` — conversation partner went offline |
| `notification:new` | server → client | Push when recipient is offline |

Offline users receive persisted notifications via `GET /api/v1/notifications`.

### REST smoke tests (PowerShell)

```powershell
cd backend
.\scripts\test-messages.ps1
```

See `docs/CHAT_FRONTEND_INTEGRATION.md` for React + Vite wiring.

## Security

- Helmet, CORS, rate limiting
- bcrypt password hashing (12 rounds)
- JWT access (15m) + refresh (7d) with rotation
- Role-based authorization
- Input validation on all write endpoints
- Parameterized SQL queries

## Scripts

| Command           | Description          |
|-------------------|----------------------|
| `npm run dev`     | Dev server with watch|
| `npm start`       | Production start     |
| `npm run db:migrate` | Run migrations    |
| `npm run db:seed` | Seed demo data       |
