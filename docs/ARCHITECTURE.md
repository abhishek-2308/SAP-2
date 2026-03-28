# Trello Cello: Production Architecture & Engineering Document

This document outlines the system design, architectural patterns, and engineering tradeoffs applied during the construction of the Trello Cello application as built in this repository.

---

## 1. System Architecture Overview

The system runs on a deeply decoupled **Three-Tier Architecture**:
1. **Frontend**: Next.js (App Router) acting purely as a Single Page Application (SPA) driven by React Query and Zustand.
2. **Backend**: Express.js REST API structured utilizing a strict Controller-Service-Repository pattern.
3. **Database**: PostgreSQL database physically segregated via Render.

### Why this structure?
* **Tradeoff**: We chose an Express API instead of Next.js Server Actions/API Routes. While Next.js backend capabilities are fast to prototype, separating the Express backend establishes a strict boundary. It allows the backend to easily scale independently, be utilized by future mobile apps without rewrite, and strictly enforces clean repository separation.

---

## 2. Database Design (PostgreSQL)

The DB is fully normalized (3NF) to prevent data anomalies. 
* Many-to-Many relationships (`card_labels`, `card_members`) utilize dedicated join tables with cascading foreign keys to ensure referential integrity.

### The Lexicographical / Decimal Ordering System (CRITICAL)
Historically, Kanban boards used integer indexing (e.g., `0, 1, 2`) which causes a massive performance flaw: dragging a card to position `0` requires updating the index of *every single subsequent card (`N` updates)*.

**Our Solution**: Use `DECIMAL(10,5)` for `position`.
* **Insert between logic**: `newPosition = (prev.position + next.position) / 2.0`
* **Tradeoff**: Using `DECIMAL` allows infinite insertions between two items with only **1 database update (O(1))**, drastically reducing database locks. Eventually, floats lose precision after repeated inserts in the identical slot, but practical real-world usage rarely hits this limit before a background cron-job normalizes them.
* **Indexes**: We aggressively indexed `CREATE INDEX ON cards(list_id, position)` ensuring `ORDER BY position ASC` queries are virtually instantaneous even with 10k+ cards.

---

## 3. Backend Implementation (Node.js + Express)

We bypassed the standard monolithic "fat-controller" design.

1. **Controllers**: Purely validate HTTP Requests, pull `req.body`, and return standard JSON formats.
2. **Services**: All business logic. Example: Calculating the drop target's new math `(prev + next) / 2`.
3. **Repositories**: The absolute *only* layer permitted to `require('pg')`. It keeps SQL statements tightly isolated against injection.

### Transactional Boundaries
* Moving a card requires updating its `list_id` and `position`. If the DB crashes mid-update, the board state corrupts. We engineered `CardService.moveCard` to utilize explicit `BEGIN`, `COMMIT`, and `ROLLBACK` blocks. If the query fails, the database reverts instantly ensuring atomicity.

---

## 4. Frontend Application (Next.js 15)

### State Management Matrix
We implemented a dual-state pattern to optimize rendering:
* **Server State (React Query / @tanstack)**: Abstracts caching, polling, and data synchronization. 
* **Global UI State (Zustand)**: A rapid, un-opinionated store tracking what list a card belongs to locally.

### Drag & Drop & Optimistic Updates
Using `@dnd-kit`, the DND system is entirely decoupled from the DOM layout.
* **The Flow**: When a user drops a card, Zustand *immediately* rewrites the UI state mimicking the drop. Only then does the asynchronous `POST /cards/move` fire.
* **Rollback Mechanism**: If the Express backend responds `500 Server Error` (e.g. network/DB failure), React Query catches the rejection and fires `rollbackCardMove()`, snapping the card safely back to its un-corrupted origin list.
* **Tradeoff**: Implementing optimistic UI adds complexity to state synchronization, but it guarantees the "zero-latency" feel critical to heavy productivity apps.

---

## 5. Testing & Failure Handling

We implemented standard layered testing to validate invariants:
1. **Supertest + Jest**: Simulates network payloads against the Express app and validates the SQL transaction rollbacks explicitly.
2. **Playwright E2E**: Automates Chromium to validate network interruptions mapping securely to Zustand fallback algorithms.

---

## 6. API Contracts

Endpoints are intent-driven rather than raw CRUD:
* `POST /lists/reorder` rather than `PATCH /lists/:id`
* `POST /cards/move` rather than `PUT /cards/:id`

Intent-based APIs clarify backend routing and map 1:1 with specific user actions, allowing scalable telemetry and activity-log expansion later.
