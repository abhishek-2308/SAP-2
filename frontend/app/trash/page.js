'use client';

import { useRouter } from 'next/navigation';
import { useTrash, useRestoreEntity, usePermanentDelete } from '@/hooks/useBoard';
import { ArrowLeft, Trash2, RefreshCcw, Layout, List, CreditCard, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TrashPage() {
  const router = useRouter();
  const { data: trash, isLoading } = useTrash();
  const restoreMutation = useRestoreEntity();
  const permanentDeleteMutation = usePermanentDelete();

  const handleRestore = (type, id) => {
    restoreMutation.mutate({ type, id });
  };

  const handlePermanentDelete = (type, id) => {
    if (confirm('Are you sure you want to permanently delete this item? This cannot be undone.')) {
      permanentDeleteMutation.mutate({ type, id });
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading trash...</div>;

  const totalItems = (trash?.boards?.length || 0) + (trash?.lists?.length || 0) + (trash?.cards?.length || 0);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border)] h-16 flex items-center px-6 sticky top-0 z-50">
        <button 
          onClick={() => router.back()}
          className="p-2 mr-4 rounded-full hover:bg-[var(--bg-list)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Trash2 size={24} className="text-red-500" />
          <h1 className="text-xl font-black tracking-tight">Trash</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {totalItems === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-16 h-16 bg-[var(--bg-list)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold">Your trash is empty</h2>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto">Items you delete will appear here for 30 days before being permanently removed.</p>
          </div>
        ) : (
          <>
            {/* Boards Section */}
            {trash.boards.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Layout size={18} />
                  <h2 className="text-sm font-black uppercase tracking-widest">Boards</h2>
                </div>
                <div className="grid gap-3">
                  {trash.boards.map(board => (
                    <TrashItem 
                      key={`board-${board.id}`}
                      title={board.title}
                      type="board"
                      date={board.deleted_at}
                      onRestore={() => handleRestore('board', board.id)}
                      onDelete={() => handlePermanentDelete('board', board.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Lists Section */}
            {trash.lists.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <List size={18} />
                  <h2 className="text-sm font-black uppercase tracking-widest">Lists</h2>
                </div>
                <div className="grid gap-3">
                  {trash.lists.map(list => (
                    <TrashItem 
                      key={`list-${list.id}`}
                      title={list.title}
                      context={`Moved from ${list.parent_title}`}
                      type="list"
                      date={list.deleted_at}
                      onRestore={() => handleRestore('list', list.id)}
                      onDelete={() => handlePermanentDelete('list', list.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Cards Section */}
            {trash.cards.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CreditCard size={18} />
                  <h2 className="text-sm font-black uppercase tracking-widest">Cards</h2>
                </div>
                <div className="grid gap-3">
                  {trash.cards.map(card => (
                    <TrashItem 
                      key={`card-${card.id}`}
                      title={card.title}
                      context={`Moved from ${card.parent_title}`}
                      type="card"
                      date={card.deleted_at}
                      onRestore={() => handleRestore('card', card.id)}
                      onDelete={() => handlePermanentDelete('card', card.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function TrashItem({ title, context, date, onRestore, onDelete }) {
  return (
    <div className="group bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-xl flex items-center justify-between hover:shadow-md hover:border-blue-500/50 transition-all">
      <div className="space-y-1">
        <h3 className="font-bold text-sm tracking-tight">{title}</h3>
        {context && <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider">{context}</p>}
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-medium">
          <Clock size={10} />
          <span>Deleted {date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : 'unknown time'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onRestore}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all text-xs font-bold"
        >
          <RefreshCcw size={14} />
          Restore
        </button>
        <button 
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all"
          title="Delete Permanently"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
