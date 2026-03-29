// ─── Board Background Themes ─────────────────────────────────────────────────
export const BOARD_BACKGROUNDS = [
  {
    id: 'default',
    label: 'Midnight Ocean',
    className: 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900',
    preview: 'linear-gradient(135deg, #0f172a 0%, #172554 50%, #1e1b4b 100%)',
  },
  {
    id: 'aurora',
    label: 'Aurora Borealis',
    className: 'bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900',
    preview: 'linear-gradient(135deg, #064e3b 0%, #115e59 50%, #164e63 100%)',
  },
  {
    id: 'sunset',
    label: 'Crimson Sunset',
    className: 'bg-gradient-to-br from-rose-900 via-pink-800 to-orange-900',
    preview: 'linear-gradient(135deg, #4c0519 0%, #9d174d 50%, #7c2d12 100%)',
  },
  {
    id: 'galaxy',
    label: 'Deep Galaxy',
    className: 'bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900',
    preview: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #701a75 100%)',
  },
  {
    id: 'forest',
    label: 'Mystic Forest',
    className: 'bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900',
    preview: 'linear-gradient(135deg, #052e16 0%, #064e3b 50%, #134e4a 100%)',
  },
  {
    id: 'steel',
    label: 'Arctic Steel',
    className: 'bg-gradient-to-br from-slate-800 via-zinc-700 to-slate-600',
    preview: 'linear-gradient(135deg, #1e293b 0%, #3f3f46 50%, #475569 100%)',
  },
];

export const getBoardBackground = (id) =>
  BOARD_BACKGROUNDS.find((b) => b.id === id) || BOARD_BACKGROUNDS[0];

// ─── List Color Themes ────────────────────────────────────────────────────────
export const LIST_THEMES = [
  {
    id: 'default',
    label: 'Default',
    header: 'var(--bg-list)',
    headerText: 'var(--text-primary)',
    body: 'var(--bg-list)',
    border: 'var(--border)',
    dot: '#64748b',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    header: 'rgba(59,130,246,0.15)',
    headerText: '#93c5fd',
    body: 'rgba(59,130,246,0.06)',
    border: 'rgba(59,130,246,0.25)',
    dot: '#3b82f6',
  },
  {
    id: 'rose',
    label: 'Rose',
    header: 'rgba(244,63,94,0.15)',
    headerText: '#fda4af',
    body: 'rgba(244,63,94,0.06)',
    border: 'rgba(244,63,94,0.25)',
    dot: '#f43f5e',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    header: 'rgba(16,185,129,0.15)',
    headerText: '#6ee7b7',
    body: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.25)',
    dot: '#10b981',
  },
  {
    id: 'amber',
    label: 'Amber',
    header: 'rgba(245,158,11,0.15)',
    headerText: '#fcd34d',
    body: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.25)',
    dot: '#f59e0b',
  },
  {
    id: 'violet',
    label: 'Violet',
    header: 'rgba(139,92,246,0.15)',
    headerText: '#c4b5fd',
    body: 'rgba(139,92,246,0.06)',
    border: 'rgba(139,92,246,0.25)',
    dot: '#8b5cf6',
  },
];

export const getListTheme = (id) =>
  LIST_THEMES.find((t) => t.id === id) || LIST_THEMES[0];

// ─── Card Color Themes ────────────────────────────────────────────────────────
export const CARD_THEMES = [
  {
    id: 'default',
    label: 'Default',
    bg: 'var(--bg-card)',
    border: 'var(--border)',
    text: 'var(--text-primary)',
    accent: null,
    dot: '#64748b',
  },
  {
    id: 'blue',
    label: 'Blue',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.3)',
    text: 'var(--text-primary)',
    accent: '#3b82f6',
    dot: '#3b82f6',
  },
  {
    id: 'rose',
    label: 'Rose',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.3)',
    text: 'var(--text-primary)',
    accent: '#f43f5e',
    dot: '#f43f5e',
  },
  {
    id: 'green',
    label: 'Green',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)',
    text: 'var(--text-primary)',
    accent: '#10b981',
    dot: '#10b981',
  },
  {
    id: 'amber',
    label: 'Amber',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    text: 'var(--text-primary)',
    accent: '#f59e0b',
    dot: '#f59e0b',
  },
  {
    id: 'violet',
    label: 'Violet',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.3)',
    text: 'var(--text-primary)',
    accent: '#8b5cf6',
    dot: '#8b5cf6',
  },
];

export const getCardTheme = (id) =>
  CARD_THEMES.find((t) => t.id === id) || CARD_THEMES[0];
