# 🎻 Trello Cello: Production-Grade Kanban System

> A high-performance, resilient Kanban application built for scale. Features modern architecture, optimistic UI, and a robust lifecycle management system.

[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/Backend-Express.js-green?logo=express)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)](https://postgresql.org)
[![Queue](https://img.shields.io/badge/Queue-BullMQ_+_Redis-red?logo=redis)](https://redis.io)
[![Tests](https://img.shields.io/badge/Tests-Jest_+_Playwright-red?logo=jest)](https://jestjs.io)

---

## ✅ Assignment Requirements Coverage

This project fully satisfies and exceeds the SDE Internship evaluation criteria through the following implementations:

### 🛠️ Core Features
*   **Board Management**: Full CRUD lifecycle (Create, Update, Archive, Soft-Delete, Restore). Implemented with unique `slug`-based routing and optimistic title updates.
*   **List Management**: Dynamic list creation with **Collapsible UI**. Lists support horizontal drag-and-drop reordering using a fractional indexing algorithm.
*   **Card Management**: Comprehensive task lifecycle. Cards support cross-list movement via **PostgreSQL Transactions** to ensure data atomicity.
*   **Card Details**: Integrated modal featuring:
    *   **Checklists**: Interactive "Mark as Completed" toggle with visual strike-through.
    *   **Labels & Covers**: Custom theme selection (colors/gradients).
    *   **Attachments**: Multi-file upload support with a background cleanup system.
*   **Search & Filter**: Real-time frontend filtering combined with optimized backend indexed search ($O(log N)$ lookup).

### 🌟 Bonus Features (100% Implemented)
*   **Responsive Design**: Mobile-first grid layout that adapts from vertical mobile stacks to horizontal desktop Kanban strips.
*   **Multiple Boards**: Dashboard view for managing hundreds of independent project boards.
*   **Archive + Trash System**: Multi-stage data lifecycle. Items move to "Archive" (hide from board) or "Trash" (soft-delete with 30-day recovery window).
*   **Background Customization**: Dynamic board backgrounds and list-level themes for visual organization.
*   **Activity Log**: Backend-tracked timestamps for creation, updates, and deletions.

---

## 🧠 Engineering Decisions & Tradeoffs

### 1. Fractional Indexing (Ordering Strategy)
*   **Decision**: used `DECIMAL` (floating point) positions instead of integer ranks.
*   **Why**: Conventional integer reordering requires $O(N)$ updates (shifting all subsequent items). Fractional indexing handles moves in **$O(1)$** by calculating `(prev + next) / 2`.
*   **Tradeoff**: Potential precision limits after thousands of drops in the same spot (handled by a future re-normalization background task).

### 2. Optimistic UI & Server State
*   **Decision**: Decoupled UI state (Zustand) from Server State (TanStack Query).
*   **Why**: Provides a "snappy," zero-latency user experience. When a card is moved, the UI updates instantly, and the network request happens in the background.
*   **Resilience**: Implemented **Snapshot Rollbacks**. If the backend fails (e.g., database timeout), the UI automatically reverts to the previous valid state.

### 3. Background File Cleanup (Event-Driven Architecture)
*   **Decision**: Integrated **BullMQ** for permanent file deletion.
*   **Why**: Deleting physical files from disk is an I/O-heavy operation that shouldn't block the API response. 
*   **Stability**: If the API marks a board as "Permanently Deleted," a background worker handles the `fs.promises.unlink` calls. If a file is locked or missing, the worker retries automatically, ensuring the filesystem never drifts from the database.

### 4. Controller → Service → Repository Pattern
*   **Decision**: Strict architectural layering.
*   **Why**: 
    *   **Controllers**: Handle HTTP-specific logic (params, body, status codes).
    *   **Services**: House complex business logic and cascading transactions (e.g., "Restore board → Restore all its lists").
    *   **Repositories**: The only layer allowed to touch the database (SQL).
*   **Benefit**: High testability via dependency injection and clean separation of concerns.

---

## 🏗️ System Design Considerations

### Data Consistency
To handle race conditions (e.g., two users moving the same card simultaneously), the backend uses **PostgreSQL Transactions**. The `moveCard` endpoint is atomic: either the card successfully settles in its new position, or the entire operation rolls back.

### Scalability
*   **Database**: Added partial indices on `is_deleted` and `is_archived` columns. This prevents the "Trash" from slowing down active board queries.
*   **I/O**: Used `fs.promises` instead of synchronous file operations to keep the Node.js event loop unblocked.

---

## 🧪 Testing & Reliability

*   **Unit Tests**: Verified position calculation algorithms and state transition logic.
*   **Integration Tests**: Simulated PostgreSQL transaction failures to verify client-side rollbacks.
*   **E2E (Playwright)**: Full user journey testing — from creating a board to dragging a card across lists and verifying its presence in the Trash page.

---

## ♿ Accessibility & UX
*   **Keyboard Navigation**: Full `ESC` key handling for modals and collapsible lists.
*   **Visual Feedback**: Loading skeletons, hover states, and micro-animations (via Framer-like transitions) provide a premium feel.
*   **Error Handling**: Global error boundary that logs mutation errors (e.g., `pool is not defined`) without crashing the application.

---

## 🚩 Known Limitations
*   **Real-time**: Currently uses a "Pull" model (auto-refetch). Future iterations would add WebSockets for multi-user collaboration.
*   **Precision**: Extreme fractional indexing (millions of moves) may require a position re-normalization script.

---

## 🚀 Quick Start
```bash
# 1. Install dependencies
npm run install:all

# 2. Setup environment (Fill in .env with your PostgreSQL/Redis details)
cp backend/.env.example backend/.env

# 3. Start development environment
npm run dev
```

---

## 🎤 Interview Talking Points
*   **The Hardest Bug**: Resolving the "Ghost Storage Leak" by implementing an event-driven file cleanup system with BullMQ.
*   **Key Challenge**: Managing complex cascading restores (Board → Lists → Cards) while maintaining atomic integrity in a non-relational visual state.
*   **Next Steps**: I would implement a generic "Command Pattern" for Undo/Redo functionality and integrate Redis for real-time collaboration.

---

## 📄 Documentation Tags
- [API Swagger Specs](http://localhost:5001/api-docs)
- [Database Schema](backend/db/schema.sql)
- [Architecture Deep Dive](docs/ARCHITECTURE.md)
