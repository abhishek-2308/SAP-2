-- ═══════════════════════════════════════════════════════
--  Trello Cello — Database Schema
--  Run: psql $DATABASE_URL -f backend/db/schema.sql
-- ═══════════════════════════════════════════════════════
-- ─── Users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Boards ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  background VARCHAR(100) DEFAULT 'default',
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Lists ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  position DECIMAL(10, 5) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Cards ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position DECIMAL(10, 5) NOT NULL DEFAULT 1.0,
  due_date TIMESTAMPTZ,
  theme VARCHAR(50) DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Labels ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS labels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL
);
-- ─── Card Labels (M:M) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS card_labels (
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);
-- ─── Card Members (M:M) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS card_members (
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, user_id)
);
-- ─── Checklists ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklists (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Checklist Items ────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklist_items (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Activities (Audit Log) ─────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  card_id INTEGER REFERENCES cards(id) ON DELETE
  SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Attachments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ─── Indexes ────────────────────────────────────────────
-- From LLD §11: Performance Optimization
CREATE INDEX IF NOT EXISTS ix_cards_pos ON cards(list_id, position);
CREATE INDEX IF NOT EXISTS idx_lists_board_position ON lists(board_id, position);
CREATE INDEX IF NOT EXISTS idx_card_labels_card ON card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_card_members_card ON card_members(card_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_list ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_attachments_card ON attachments(card_id);