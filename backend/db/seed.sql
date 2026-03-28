-- ═══════════════════════════════════════════════════════
--  Trello Cello — Seed / Demo Data
--  Run: psql $DATABASE_URL -f backend/db/seed.sql
-- ═══════════════════════════════════════════════════════

-- ─── Users ──────────────────────────────────────────────
INSERT INTO users (name, email) VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith',     'bob@example.com'),
  ('Carol White',   'carol@example.com')
ON CONFLICT DO NOTHING;

-- ─── Labels ─────────────────────────────────────────────
INSERT INTO labels (name, color) VALUES
  ('Bug',      '#ef4444'),
  ('Feature',  '#3b82f6'),
  ('Design',   '#a855f7'),
  ('Backend',  '#f97316'),
  ('Frontend', '#22c55e')
ON CONFLICT DO NOTHING;

-- ─── Boards ─────────────────────────────────────────────
INSERT INTO boards (title) VALUES
  ('🚀 Product Roadmap'),
  ('🐛 Bug Tracker'),
  ('💡 Ideas Backlog')
ON CONFLICT DO NOTHING;

-- ─── Lists (Board 1 — Product Roadmap) ─────────────────
INSERT INTO lists (board_id, title, position) VALUES
  (1, 'Backlog',     1.0),
  (1, 'In Progress', 2.0),
  (1, 'Review',      3.0),
  (1, 'Done',        4.0);

-- ─── Lists (Board 2 — Bug Tracker) ──────────────────────
INSERT INTO lists (board_id, title, position) VALUES
  (2, 'Open',        1.0),
  (2, 'In Progress', 2.0),
  (2, 'Resolved',    3.0);

-- ─── Cards (Board 1 — Backlog) ──────────────────────────
INSERT INTO cards (list_id, title, description, position, due_date) VALUES
  (1, 'Set up project scaffolding', 'Create frontend/backend folders and root config', 1.0, NOW() + INTERVAL '2 days'),
  (1, 'Design database schema',     'ERD for boards, lists, cards, users',             2.0, NOW() + INTERVAL '3 days'),
  (1, 'API contract definition',    'Define RESTful endpoints per LLD',                3.0, NOW() + INTERVAL '4 days');

-- ─── Cards (Board 1 — In Progress) ──────────────────────
INSERT INTO cards (list_id, title, description, position, due_date) VALUES
  (2, 'Build Express backend',   'Controllers, services, repositories',        1.0, NOW() + INTERVAL '1 day'),
  (2, 'Implement drag-and-drop', 'dnd-kit integration with optimistic updates', 2.0, NOW() + INTERVAL '5 days');

-- ─── Cards (Board 1 — Review) ───────────────────────────
INSERT INTO cards (list_id, title, description, position) VALUES
  (3, 'Authentication flow', 'JWT based auth with refresh tokens', 1.0);

-- ─── Cards (Board 1 — Done) ─────────────────────────────
INSERT INTO cards (list_id, title, description, position) VALUES
  (4, 'Project planning',  'Create HLD and LLD docs',        1.0),
  (4, 'Tech stack choice', 'Next.js + Express + PostgreSQL',  2.0);

-- ─── Checklists ─────────────────────────────────────────
INSERT INTO checklists (card_id, title) VALUES
  (1, 'Setup Checklist');

INSERT INTO checklist_items (checklist_id, content, is_completed) VALUES
  (1, 'Create package.json',    TRUE),
  (1, 'Set up .env files',      TRUE),
  (1, 'Create folder structure', FALSE);

-- ─── Card Labels ────────────────────────────────────────
INSERT INTO card_labels (card_id, label_id) VALUES
  (1, 2),  -- Set up project → Feature
  (4, 4),  -- Build Express  → Backend
  (5, 5);  -- DnD            → Frontend

-- ─── Card Members ───────────────────────────────────────
INSERT INTO card_members (card_id, user_id) VALUES
  (1, 1),  -- Alice on project scaffolding
  (4, 2),  -- Bob on Express backend
  (5, 3);  -- Carol on drag-and-drop
