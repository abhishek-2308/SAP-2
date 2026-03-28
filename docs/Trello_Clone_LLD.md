# LLD — Trello Clone Internal Design

## 1. Overview
This document defines the low-level design of the system, including modules, classes, APIs, and internal logic.

---

## 2. Backend Module Design

### 2.1 Folder Structure

backend/
├── controllers/
├── services/
├── repositories/
├── models/
├── routes/
├── middlewares/
├── utils/
└── config/

---

## 3. Module Responsibilities

### 3.1 Controllers Layer

Purpose:
- Handle HTTP requests and responses
- Validate input
- Call service layer

Example: CardController.js

Functions:
- createCard(req, res)
- updateCard(req, res)
- deleteCard(req, res)
- moveCard(req, res)

---

### 3.2 Services Layer

Purpose:
- Business logic
- Transaction handling
- Data validation

Example: CardService.js

Functions:

createCard(data):
- validate input
- assign default position
- call repository

moveCard(cardId, sourceListId, targetListId, newPosition):
- validate lists
- calculate new position
- update card

---

### 3.3 Repository Layer

Purpose:
- Direct DB interaction
- SQL queries

Example: CardRepository.js

Functions:

createCard(data):
- INSERT INTO cards

updateCard(id, data):
- UPDATE cards SET ...

getCardsByList(listId):
- SELECT * FROM cards WHERE list_id

---

### 3.4 Models

Purpose:
- Define schema mappings

Example:
- Card model
- List model
- Board model

---

## 4. Frontend Module Design

### 4.1 Folder Structure

frontend/
├── components/
├── pages/
├── hooks/
├── store/
├── services/
└── utils/

---

### 4.2 Components

Board:
- Fetch board data
- Render lists

List:
- Render cards
- Handle list-level drag

Card:
- Render card UI
- Open modal

CardModal:
- Edit card details

---

### 4.3 State Management

Global State (Zustand):
- board data
- UI state

Server State (React Query):
- API data caching
- refetch logic

---

## 5. API Contracts

### 5.1 Create Card

POST /cards

Request:
{
  "listId": "1",
  "title": "Task"
}

Response:
{
  "id": "123",
  "title": "Task",
  "position": 1.0
}

---

### 5.2 Move Card

POST /cards/move

Request:
{
  "cardId": "123",
  "sourceListId": "1",
  "targetListId": "2",
  "newPosition": 1.5
}

Response:
{
  "success": true
}

---

## 6. Drag & Drop Algorithm

Steps:
1. Identify source and destination
2. Calculate new position:
   - between two cards → avg position
   - empty list → position = 1
3. Update UI optimistically
4. Send API request
5. Handle failure rollback

---

## 7. Database Queries

### Get Board Details

SELECT boards, lists, cards
FROM boards
JOIN lists ON board_id
JOIN cards ON list_id

---

## 8. Error Handling

- Try-catch in services
- Middleware for global errors
- Return structured responses

---

## 9. Validation

- Input validation in controllers
- Business validation in services

---

## 10. Logging

- Request logging
- Error logging

---

## 11. Performance Optimization

- Indexing:
  CREATE INDEX ON cards(list_id, position)

- Avoid full reloads
- Use caching (React Query)

---

## 12. Edge Cases

- Moving card to empty list
- Deleting list with cards
- Reordering at boundaries

---

## 13. Transaction Handling

Use DB transactions for:
- Moving cards
- Reordering lists

---

## 14. Security (Basic)

- Input sanitization
- Prevent SQL injection

---

## 15. Conclusion

This LLD ensures:
- Modular architecture
- Scalable design
- Maintainable codebase

