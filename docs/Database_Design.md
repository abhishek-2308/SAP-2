# Database Design — Tables and Relationships

## Overview
Relational database using PostgreSQL with normalized schema.

## Tables

### boards
- id (PK)
- title
- created_at

### lists
- id (PK)
- board_id (FK → boards.id)
- title
- position (DECIMAL)

### cards
- id (PK)
- list_id (FK → lists.id)
- title
- description
- position (DECIMAL)
- due_date

### users
- id (PK)
- name

### labels
- id (PK)
- name
- color

### card_labels
- card_id (FK)
- label_id (FK)

### card_members
- card_id (FK)
- user_id (FK)

### checklists
- id (PK)
- card_id (FK)
- title

### checklist_items
- id (PK)
- checklist_id (FK)
- content
- is_completed (BOOLEAN)

## Relationships
- One board → many lists
- One list → many cards
- Many-to-many:
  - cards ↔ labels
  - cards ↔ users

## Indexing
CREATE INDEX idx_cards_list_position ON cards(list_id, position);

