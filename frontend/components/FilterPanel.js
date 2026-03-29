'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { getAllLabels, getAllUsers } from '@/lib/api';

export default function FilterPanel({ activeFilters, onFilterChange }) {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState([]);
  const [users, setUsers] = useState([]);

  // Local state for the panel forms
  const [selectedLabel, setSelectedLabel] = useState(activeFilters.labelId || '');
  const [selectedMember, setSelectedMember] = useState(activeFilters.memberId || '');
  const [hasDueDate, setHasDueDate] = useState(activeFilters.hasDueDate || false);
  const [overdue, setOverdue] = useState(activeFilters.overdue || false);

  useEffect(() => {
    if (open) {
      setSelectedLabel(activeFilters.labelId || '');
      setSelectedMember(activeFilters.memberId || '');
      setHasDueDate(activeFilters.hasDueDate || false);
      setOverdue(activeFilters.overdue || false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      getAllLabels().then(setLabels).catch(() => {});
      getAllUsers().then(setUsers).catch(() => {});
    }
  }, [open]);

  function applyFilters() {
    const filters = {};
    if (selectedLabel) filters.labelId = selectedLabel;
    if (selectedMember) filters.memberId = selectedMember;
    if (hasDueDate) filters.hasDueDate = true;
    if (overdue) filters.overdue = true;
    onFilterChange(filters);
    setOpen(false);
  }

  function clearFilters() {
    setSelectedLabel('');
    setSelectedMember('');
    setHasDueDate(false);
    setOverdue(false);
    onFilterChange({});
    setOpen(false);
  }

  const hasActive = Object.keys(activeFilters).length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`
          text-[13px] px-3 py-1.5 rounded flex items-center gap-1.5
          transition-all border font-bold shadow-sm
          ${hasActive
            ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
          }
        `}
      >
        <Filter size={14} />
        Filter{hasActive && ' ●'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-slate-800 font-bold text-sm">Filter Cards</h4>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">Label</label>
                <select 
                  value={selectedLabel} 
                  onChange={(e) => setSelectedLabel(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
                >
                  <option value="">All Labels</option>
                  {labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-widest">Member</label>
                <select 
                  value={selectedMember} 
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
                >
                  <option value="">All Members</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded">
                  <input type="checkbox" checked={hasDueDate} onChange={(e) => setHasDueDate(e.target.checked)} className="accent-blue-600 h-4 w-4 rounded border-slate-300" />
                  Has due date
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded">
                  <input type="checkbox" checked={overdue} onChange={(e) => setOverdue(e.target.checked)} className="accent-red-600 h-4 w-4 rounded border-slate-300" />
                  Overdue only
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-200 mt-4">
              <button 
                onClick={applyFilters} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest py-2 rounded shadow-sm transition-colors"
              >
                Apply
              </button>
              <button 
                onClick={clearFilters} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-widest py-2 rounded transition-colors border border-slate-300"
              >
                Reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
