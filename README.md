# Trello Cello 🎻

> A production-grade Kanban board application built with Next.js, Express, and PostgreSQL.

[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/Backend-Express.js-green?logo=express)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)](https://postgresql.org)
[![Tests](https://img.shields.io/badge/Tests-Jest_+_Playwright-red?logo=jest)](https://jestjs.io)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel_+_Render-purple)](https://vercel.com)

---

## 🏗️ Architecture

```
trello_cello/
├── backend/                  # Express.js REST API
│   ├── controllers/          # HTTP request/response handlers (thin layer)
│   ├── services/             # Business logic + transactions
│   ├── repositories/         # SQL queries (only layer using pg)
│   ├── routes/               # Swagger-annotated Express routers
│   ├── middleware/           # errorHandler, requestLogger
│   ├── config/               # db.js (pg pool), swagger.js
│   └── db/
│       ├── schema.sql        # Full PostgreSQL schema
│       └── seed.sql          # Demo data
│
├── frontend/                 # Next.js 15 App Router
│   ├── app/                  # Page routes + layout
│   ├── components/           # KanbanBoard, KanbanList, KanbanCard, CardModal, BoardCard
│   ├── store/boardStore.js   # Zustand — UI + optimistic state
│   ├── hooks/useBoard.js     # React Query — server state + caching
│   └── lib/api.js            # Axios instance + endpoint wrappers
│
├── tests-e2e/                # Playwright E2E specs
│   ├── board.spec.js         # Create → List → Card → Modal flows
│   └── edge-cases.spec.js    # Rollback, spam clicks, empty board
│
└── playwright.config.js
```

---

## ⚡ Key Engineering Decisions

| Decision | Approach | Why |
|---|---|---|
| **Ordering** | `DECIMAL` position | O(1) insert vs O(N) with integer index |
| **Move cards** | DB Transaction (BEGIN/COMMIT/ROLLBACK) | Atomicity — prevents corrupt positions |
| **UI Updates** | Optimistic (Zustand → rollback on error) | Zero-latency Trello-like feel |
| **API Design** | Intent-based (`POST /cards/move`) | Maps to user actions, not DB ops |
| **State** | React Query (server) + Zustand (UI) | Separation of caching from UI mutations |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL (or Render)

### 1. Install
```bash
git clone <repo-url>
cd trello_cello
npm run install:all
```

### 2. Configure environment
```bash
# Backend
cp backend/.env.example backend/.env
# Fill in DATABASE_URL, PORT=5001, CLIENT_URL=http://localhost:3000

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > frontend/.env.local
```

### 3. Run Database Migrations
```bash
# Render (external URL with SSL)
psql $DATABASE_URL -f backend/db/schema.sql
psql $DATABASE_URL -f backend/db/seed.sql
```

### 4. Start Development
```bash
npm run dev
# Frontend → http://localhost:3000
# Backend  → http://localhost:5001
# API Docs → http://localhost:5001/api-docs
```

---

## 📖 API Documentation

Swagger UI available at:
```
http://localhost:5001/api-docs
```

Raw OpenAPI spec:
```
http://localhost:5001/api-docs.json
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/boards` | List all boards |
| `POST` | `/boards` | Create board |
| `GET` | `/boards/:id/details` | Full board with lists + cards |
| `POST` | `/lists` | Create list |
| `POST` | `/lists/reorder` | Reorder list (decimal position) |
| `POST` | `/cards` | Create card |
| `POST` | `/cards/move` | Move card across lists (transactional) |
| `PATCH` | `/cards/:id` | Update card details |
| `DELETE` | `/cards/:id` | Delete card |

---

## 🧪 Testing

```bash
# Unit + Integration (Jest + Supertest)
npm run test

# E2E (Playwright — Chromium)
npm run test:e2e
```

Test coverage:
- ✅ Board CRUD + validation
- ✅ Card move transaction + rollback simulation
- ✅ Frontend component rendering + snapshots
- ✅ E2E: Create board → list → card flow
- ✅ E2E: Network failure rollback
- ✅ E2E: Spam click deduplication

---

## 🚢 Deployment

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

### Backend → Render (Web Service)
| Setting | Value |
|---|---|
| Build Command | `npm install` |
| Start Command | `node index.js` |
| Root Directory | `backend` |

Environment variables:
```
DATABASE_URL=<Render Internal DB URL>
PORT=5001
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Database → Render PostgreSQL
```bash
# Run schema migration via PSQL
PGPASSWORD=<password> psql -h <host>.render.com -U <user> <db> -f backend/db/schema.sql
```

---

## 🎯 Position Algorithm (Drag & Drop)

```
Insert between cards:   newPosition = (prev.position + next.position) / 2
Drop at top of list:    newPosition = firstCard.position / 2
Drop on empty list:     newPosition = 1.0
Append to list:         newPosition = lastCard.position + 1
```

This ensures **O(1) DB writes** per drag operation regardless of board size.

---

## 📄 Documentation

See `/docs` for:
- [HLD](docs/Trello_Clone_HLD.md)
- [LLD](docs/Trello_Clone_LLD.md)
- [Database Design](docs/Database_Design.md)
- [API Contracts](docs/API_Contracts.md)
- [Architecture](docs/ARCHITECTURE.md)
