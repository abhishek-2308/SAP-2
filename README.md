# Trello Cello: Kanban Project Management Tool

> A full-stack Trello-like Kanban application built using Next.js, Express, and PostgreSQL, focusing on clean architecture, smooth UX, and reliable data handling.

[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js)](https://nextjs.org)
[![Backend](https://img.shields.io/badge/Backend-Express.js-green?logo=express)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)](https://postgresql.org)
[![Queue](https://img.shields.io/badge/Queue-BullMQ_+_Redis-red?logo=redis)](https://redis.io)
[![Tests](https://img.shields.io/badge/Tests-Jest_+_Playwright-red?logo=jest)](https://jestjs.io)

---

## 🚀 Live Deployments

* **Frontend (Vercel)**: https://trello-abhishek.vercel.app
* **API Docs**: https://trello-cello-api.onrender.com/api-docs

---

## ✅ Assignment Requirements Coverage

This project implements all required features from the SDE Fullstack assignment.

### 🛠 Core Features

* **Board Management**

  * Create, view, update, archive, and delete boards
  * Unique routing using slugs

* **List Management**

  * Create, edit, delete lists
  * Drag-and-drop reordering (horizontal)

* **Card Management**

  * Create, edit, delete, archive cards
  * Move cards across lists with consistent ordering

* **Card Details**

  * Labels, due dates, members
  * Checklist with completion toggle
  * Attachments and card covers

* **Search & Filter**

  * Search cards by title
  * Filter using labels and metadata

---

### 🌟 Bonus Features

* Responsive UI (mobile, tablet, desktop)
* Multiple boards dashboard
* Archive + Trash system (restore supported)
* File attachments with cleanup handling
* Activity logs for tracking changes
* Board background and card customization
* Keyboard accessibility (ESC, focus states)

---

## 🧠 Key Engineering Decisions

### 1. Ordering Strategy

* Used fractional indexing (`DECIMAL`)
* Allows inserting items without reordering entire list
* Improves performance for drag-and-drop operations

---

### 2. Optimistic UI

* UI updates instantly before server response
* Improves perceived performance
* Rollback implemented on failure

---

### 3. Background File Cleanup

* Attachments are deleted using background jobs (BullMQ)
* Prevents API blocking and storage leaks

---

### 4. Backend Architecture

* Controller → Service → Repository pattern
* Separates HTTP logic, business logic, and database queries
* Improves maintainability and testability

---

## 🏗️ System Design Considerations

* **Data Consistency**

  * Transactions used for card movement to avoid inconsistent states

* **Scalability**

  * Indexed queries for active vs deleted data
  * Non-blocking file operations using async APIs

---

## 🧪 Testing

* Unit tests for core logic (ordering, state updates)
* Integration tests for API behavior
* End-to-end tests (Playwright) for user flows

---

## ♿ Accessibility & UX

* Keyboard navigation support (ESC, tab focus)
* Clear focus indicators
* Responsive layout for all screen sizes

---

## 🚩 Known Limitations

* No real-time sync (planned via WebSockets)
* Ordering precision may need rebalancing after many operations

---

## 🚀 Quick Start

```bash
npm run install:all
cp backend/.env.example backend/.env
npm run dev
```

---

## 🎤 Interview Highlights

* Implemented optimistic UI with rollback for better UX
* Designed efficient ordering system using fractional indexing
* Solved file storage leak using background cleanup jobs
* Built a complete lifecycle system (archive, trash, restore)

---

## 📄 Documentation

* API Docs: /api-docs
* Database Schema: backend/db/schema.sql
* Architecture: docs/ARCHITECTURE.md
