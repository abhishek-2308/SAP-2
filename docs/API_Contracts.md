# API Contracts — Communication Layer

## Principles
- RESTful + intent-based APIs
- JSON request/response

---

## Board APIs

POST /boards
Request:
{ "title": "Project" }

GET /boards/:id/details
Response:
{
  "board": {},
  "lists": [],
  "cards": []
}

---

## List APIs

POST /lists
{ "boardId": "1", "title": "Todo" }

POST /lists/reorder
{
  "listId": "1",
  "newPosition": 2.5
}

---

## Card APIs

POST /cards
{ "listId": "1", "title": "Task" }

POST /cards/move
{
  "cardId": "123",
  "sourceListId": "1",
  "targetListId": "2",
  "newPosition": 1.5
}

---

## Error Response

{
  "success": false,
  "error": "Invalid input"
}

