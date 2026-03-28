# HLD — Trello Clone System Architecture

## 1. System Overview
This system is a Kanban-style project management application designed to mimic Trello. It follows a client-server architecture with clear separation of concerns.

---

## 2. High-Level Architecture

Client (Next.js)
    ↓
API Layer (Node.js + Express)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (DB Access)
    ↓
PostgreSQL (Render)

---

## 3. Components Breakdown

### 3.1 Frontend (Next.js)
- Framework: Next.js (App Router)
- State Management: Zustand
- Server State: React Query
- UI: Tailwind CSS
- Drag & Drop: dnd-kit

Responsibilities:
- Render boards, lists, cards
- Handle drag-and-drop interactions
- Optimistic UI updates
- Communicate with backend APIs

---

### 3.2 Backend (Node.js + Express)

Layers:

#### Controllers
- Handle HTTP requests
- Validate input
- Call services

#### Services
- Business logic
- Handle operations like moving cards, assigning members

#### Repositories
- DB queries
- Use PostgreSQL

#### Middlewares
- Error handling
- Logging

---

### 3.3 Database (PostgreSQL)

Core Tables:
- boards
- lists
- cards
- users
- labels
- card_labels
- card_members
- checklists
- checklist_items

Key Design:
- Normalized schema
- Use DECIMAL for ordering (position)
- Index frequently queried columns

---

## 4. Data Flow

### 4.1 Load Board
1. Client requests board details
2. Backend aggregates data
3. DB returns lists + cards
4. Client renders UI

---

### 4.2 Drag & Drop (Move Card)
1. User drags card
2. UI updates immediately (optimistic)
3. API call sent
4. Backend updates DB
5. If fail → rollback UI

---

## 5. API Layer

Examples:

POST /boards
GET /boards/:id/details
POST /lists/reorder
POST /cards/move

Design:
- Intent-based APIs
- RESTful structure

---

## 6. Scalability Considerations

- Pagination for cards
- Index on (list_id, position)
- Avoid full board reload
- Lazy loading

---

## 7. Deployment Architecture

Frontend → Vercel  
Backend → Render  
Database → Render PostgreSQL  

---

## 8. Performance Strategies

- Optimistic UI
- Debounced search
- Virtualized rendering (large lists)

---

## 9. Failure Handling

- API failure → rollback UI
- Validation errors handled in middleware
- Logging for debugging

---

## 10. Future Enhancements

- WebSockets for real-time sync
- Authentication system
- Activity logs
- File uploads

---

## 11. Key Engineering Decisions

- Used Next.js for scalability
- Used PostgreSQL for relational integrity
- Used normalized schema for flexibility
- Used decimal ordering for efficient reordering

---

## 12. Conclusion

This architecture ensures:
- Scalability
- Maintainability
- Performance
- Clean separation of concerns

