# HustleBridge

Turn Skills Into Opportunities.

HustleBridge is a student-focused freelance marketplace that connects talented students and freelancers with businesses looking for project-based work.

**Live demo:** [neon-hustle-bridge.vercel.app](https://neon-hustle-bridge.vercel.app)

## Implemented

### Frontend (React + TypeScript + Vite + TanStack Router)

- Landing page with honest product messaging (no fabricated metrics)
- User registration and login (student / client roles)
- Opportunity marketplace (list, search, category filter)
- Opportunity detail pages with apply flow
- Student dashboard (stats, recommendations, profile strength)
- Client dashboard (post projects, view applicants, accept/reject)
- Student profile and settings pages
- AI outreach generator (Gemini API with local fallback)
- Notifications list
- Messaging UI (backend integrated; send UI partial)
- JWT session persistence via localStorage
- Protected routes with login redirect

### Backend (Node.js + Express + PostgreSQL)

- REST API at `/api/v1`
- JWT authentication with refresh tokens
- User registration and login with bcrypt password hashing
- Opportunity CRUD (clients)
- Application submit and status management
- Student and client dashboards
- Real-time messaging via Socket.IO
- Notifications on application events
- AI outreach generation endpoint
- Rate limiting, validation, error handling

### Database

- PostgreSQL (Neon-compatible)
- SQL migrations in `backend/src/db/migrations/`
- Idempotent demo seed script

## Roadmap / Future

- Token refresh flow on the frontend
- Payment integration and escrow
- Video interviews
- Team workspaces
- Advanced analytics dashboard
- AI resume builder and skill assessment
- Full messaging send UI polish

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite 7, TanStack Router/Start, TanStack Query, Tailwind CSS 4, Framer Motion, Radix UI |
| Backend | Node.js 20+, Express 5, PostgreSQL (`pg`), JWT, bcrypt, Socket.IO |
| AI | Google Gemini API (optional) |
| Deploy | Vercel (frontend), Render (backend), Neon (database) |

## Project Structure

```text
src/                    # Frontend (TanStack Start)
├── routes/             # File-based routes
├── components/         # UI and site components
└── lib/                # API client, auth helpers

backend/
├── src/
│   ├── routes/         # Express route definitions
│   ├── controllers/    # HTTP handlers
│   ├── services/       # Business logic
│   ├── models/         # SQL queries
│   └── db/             # Migrations and seed
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or Neon)

### Frontend

```bash
npm install
npm run dev
```

Set `VITE_API_URL` to your backend URL (defaults to `http://localhost:4000/api/v1`).

### Backend

```bash
cd backend
cp .env.example .env   # configure DATABASE_URL, JWT secrets
npm install
npm run db:migrate
npm run db:seed          # creates demo accounts + 10 opportunities
npm run dev
```

### Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Student | `demo.student@hustlebridge.local` | `DemoPass1` |
| Client | `demo.client@hustlebridge.local` | `DemoPass1` |

These are demo-only accounts marked with `is_demo = true` in the database. Do not use weak passwords for real production accounts.

### Build

```bash
# Frontend
npm run build

# Backend (no build step — runs directly with Node)
cd backend && npm start
```

## Deployment

- **Frontend:** Deploy to Vercel; set `VITE_API_URL` to your Render backend URL.
- **Backend:** Deploy to Render; set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CORS_ORIGIN` (your Vercel URL).
- **Database:** Run migrations and seed on your Neon/PostgreSQL instance:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

## Design System

```css
Background: #050505
Card: #101010
Neon Yellow: #F5E400
Neon Pink: #FF0A78
Text: #FFFFFF
```

## License

MIT License

Built for students, freelancers, creators, developers, designers, writers, and businesses.
