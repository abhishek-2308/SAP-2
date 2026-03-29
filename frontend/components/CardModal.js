'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Layout, X, Calendar, AlignLeft, CheckSquare, Users, Tag, Trash2, Plus, ArrowRight, Paperclip, FileText, Download, Check, Image } from 'lucide-react';
import { getCardLabels, getAllLabels, addCardLabel, removeCardLabel, getCardMembers, getAllUsers, assignCardMember, removeCardMember, getCardChecklists, createChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem, getActivities, getAttachments, uploadAttachment, deleteAttachment } from '@/lib/api';
import { CARD_THEMES, getCardTheme } from '@/lib/themes';
import { cn } from '@/lib/utils';

export default function CardModal({ card, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [dueDate, setDueDate] = useState(card?.due_date ? new Date(card.due_date).toISOString().split('T')[0] : '');
  const [isSaving, setIsSaving] = useState(false);
  const [labels, setLabels] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [isUploading, setIsUploading] = useState(false);
  const [cardThemeId, setCardThemeId] = useState(card?.theme || 'default');
  const cardCoverTheme = getCardTheme(cardThemeId);

  const loadDetails = useCallback(async () => {
    if (!card?.id) return;
    try {
      const [cardLabels, labelsAll, cardMembers, usersAll, cls, acts, atts] = await Promise.all([
        getCardLabels(card.id), getAllLabels(), getCardMembers(card.id), getAllUsers(), getCardChecklists(card.id), getActivities(null, card.id), getAttachments(card.id)
      ]);
      setLabels(cardLabels); setAllLabels(labelsAll); setMembers(cardMembers); setAllUsers(usersAll); setChecklists(cls); setActivities(acts); setAttachments(atts);
    } catch { /* Silent */ }
  }, [card?.id]);

  useEffect(() => { loadDetails(); }, [loadDetails]);

  const toggleLabel = async (lid) => {
    const active = labels.some(l => l.id === lid);
    try {
      if (active) { await removeCardLabel(card.id, lid); setLabels(p => p.filter(l => l.id !== lid)); }
      else { await addCardLabel(card.id, lid); setLabels(p => [...p, allLabels.find(l => l.id === lid)]); }
      // Reload activities after action
      getActivities(null, card.id).then(setActivities);
    } catch { toast.error('Sync failed'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
       const res = await uploadAttachment(card.id, file);
       setAttachments(p => [res, ...p]);
       toast.success('File attached');
       getActivities(null, card.id).then(setActivities);
    } catch { toast.error('Upload failed'); }
    finally { setIsUploading(false); }
  };

  const addItem = async (clid) => {
    const c = newItemContent[clid]?.trim(); if (!c) return;
    try { 
      const i = await addChecklistItem(clid, c); 
      setChecklists(p => p.map(cl => cl.id === clid ? { ...cl, items: [...cl.items, i] } : cl)); 
      setNewItemContent(p => ({ ...p, [clid]: '' }));
    } catch { toast.error('Sync failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 5 }} className="relative bg-white dark:bg-[#282e33] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        
        {/* Card Cover Preview Strip */}
        {cardCoverTheme.accent && (
          <div
            className="h-10 w-full shrink-0 transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${cardCoverTheme.accent}ee, ${cardCoverTheme.accent}88)` }}
          />
        )}
        {/* Simple Header */}
        <div className="flex-none p-6 flex items-start justify-between bg-[var(--bg-card)] border-b border-[var(--border)]">
          <div className="flex-1 pr-6 flex items-center gap-3">
            <Layout size={20} className="text-[var(--text-muted)] mt-1" />
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent text-lg font-black text-[var(--text-primary)] hover:bg-[var(--bg-list)] focus:bg-[var(--bg-card)] focus:ring-2 focus:ring-blue-600 rounded px-2 py-1 outline-none transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-list)] rounded-lg transition-all"><X size={20}/></button>
        </div>

        {/* Action Tabs */}
        <div className="flex px-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
          {[ 'details', 'cover', 'labels', 'members', 'attachments', 'checklists', 'activity' ].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn("px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all shrink-0", activeTab === t ? 'border-blue-700 text-blue-700 dark:border-blue-500 dark:text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200')}>{t}</button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-[#282e33]">
          {activeTab === 'cover' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Image size={14}/> Card Cover Color</label>
              <div className="grid grid-cols-3 gap-3">
                {CARD_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCardThemeId(t.id)}
                    className="relative h-14 rounded-xl overflow-hidden border-2 transition-all group"
                    style={{
                      background: t.accent ? `linear-gradient(135deg, ${t.accent}dd, ${t.accent}55)` : '#f1f5f9',
                      borderColor: cardThemeId === t.id ? '#3b82f6' : 'transparent',
                      boxShadow: cardThemeId === t.id ? '0 0 0 3px rgba(59,130,246,0.3)' : undefined,
                    }}
                    title={t.label}
                  >
                    {cardThemeId === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check size={12} className="text-blue-600" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/30 text-white text-[9px] font-bold text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Selected: <span className="font-bold text-slate-600">{cardCoverTheme.label}</span> — saves when you click &ldquo;Save &amp; Close&rdquo;</p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2"><AlignLeft size={14}/> Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add more context..." rows={4} className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none shadow-inner" />
              <div className="w-64">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2 mb-2"><Calendar size={14}/> Target Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2.5 text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-600 shadow-sm custom-date-input" />
              </div>
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="grid grid-cols-2 gap-3">
              {allLabels.map(l => (
                <button key={l.id} onClick={() => toggleLabel(l.id)} className={cn("flex items-center gap-3 p-4 rounded-xl border-2 transition-all shadow-sm", labels.some(cl => cl.id === l.id) ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-list)]')}>
                  <div className="w-10 h-5 rounded-full shadow-inner" style={{ backgroundColor: l.color }} />
                  <span className="text-xs font-black uppercase tracking-tight text-[var(--text-primary)]">{l.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {allUsers.map(u => {
                  const isAssigned = members.some(m => m.id === u.id);
                  return (
                    <button 
                      key={u.id} 
                      onClick={async () => {
                        try {
                          if (isAssigned) { await removeCardMember(card.id, u.id); setMembers(p => p.filter(m => m.id !== u.id)); }
                          else { await assignCardMember(card.id, u.id); setMembers(p => [...p, u]); }
                        } catch { toast.error('Sync failed'); }
                      }}
                      className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all", isAssigned ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-list)]')}
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-list)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] border border-[var(--border)]">{u.name.charAt(0)}</div>
                      <div className="flex-1 text-left">
                         <div className="text-sm font-bold text-[var(--text-primary)]">{u.name}</div>
                         <div className="text-[10px] text-[var(--text-muted)]">{u.email}</div>
                      </div>
                      {isAssigned && <div className="bg-blue-600 text-white p-1 rounded-full"><Check size={14}/></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2"><Paperclip size={14}/> Attachments</h4>
                    <label className={cn("btn btn-primary px-4 py-1.5 font-bold text-[10px] cursor-pointer", isUploading && "opacity-50 pointer-events-none")}>
                        {isUploading ? 'Uploading...' : 'Upload File'}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading}/>
                    </label>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                   {attachments.length > 0 ? attachments.map(att => (
                     <div key={att.id} className="group flex items-center gap-4 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border)] hover:border-blue-400 transition-all shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-[var(--bg-list)] flex items-center justify-center text-[var(--text-muted)]">
                           <FileText size={24}/>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-black text-[var(--text-primary)] truncate">{att.original_name}</div>
                           <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tight">
                              {(att.size / 1024).toFixed(1)} KB • {new Date(att.created_at).toLocaleDateString()}
                           </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/uploads/${att.filename}`} download={att.original_name} target="_blank" rel="noreferrer" className="p-2 text-[var(--text-secondary)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                              <Download size={16}/>
                           </a>
                           <button onClick={() => deleteAttachment(att.id).then(() => { setAttachments(p => p.filter(a => a.id !== att.id)); getActivities(null, card.id).then(setActivities); })} className="p-2 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                              <Trash2 size={16}/>
                           </button>
                        </div>
                     </div>
                   )) : (
                     <div className="text-center py-8 bg-[var(--bg-list)] rounded-2xl border-2 border-dashed border-[var(--border)]">
                        <Paperclip size={24} className="mx-auto text-[var(--text-muted)] mb-2"/>
                        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">No attachments yet</p>
                     </div>
                   )}
                </div>
            </div>
          )}

          {activeTab === 'checklists' && (
            <div className="space-y-8">
              {checklists.map(cl => (
                <div key={cl.id} className="space-y-4">
                  <div className="flex items-center justify-between group">
                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                       <CheckSquare size={16} className="text-blue-600"/>
                       {cl.title}
                    </h4>
                    <button onClick={() => deleteChecklist(cl.id).then(() => setChecklists(p => p.filter(c => c.id !== cl.id)))} className="text-[var(--text-muted)] hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                  </div>
                  
                  <div className="space-y-2 pl-6 border-l-2 border-[var(--border)] ml-2">
                    {cl.items.map(i => (
                      <div key={i.id} className="flex items-center gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-list)] transition-all cursor-pointer shadow-sm group" onClick={() => toggleChecklistItem(i.id).then(it => setChecklists(p => p.map(cl => cl.id === it.checklist_id ? { ...cl, items: cl.items.map(item => item.id === it.id ? it : item) } : cl)))}>
                        <div className={cn("w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center", i.is_completed ? 'bg-green-600 border-green-600 shadow-sm' : 'border-[var(--border)]')}>
                          {i.is_completed && <Check size={12} className="text-white font-black"/>}
                        </div>
                        <span className={cn("flex-1 text-sm font-medium", i.is_completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]')}>
                          {i.content}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); deleteChecklistItem(i.id).then(() => setChecklists(p => p.map(cl2 => cl2.id === i.checklist_id ? { ...cl2, items: cl2.items.filter(it => it.id !== i.id) } : cl2))); }} className="p-1.5 text-[var(--text-secondary)] hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pl-8">
                    <input 
                      type="text" 
                      value={newItemContent[cl.id] || ''} 
                      onChange={e => setNewItemContent(p => ({ ...p, [cl.id]: e.target.value }))} 
                      onKeyDown={e => e.key === 'Enter' && addItem(cl.id)} 
                      placeholder="Add an item..." 
                      className="w-full bg-[var(--bg-list)] border border-[var(--border)] rounded-lg py-1.5 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-600 text-[var(--text-primary)] focus:bg-[var(--bg-card)] transition-all shadow-inner" 
                    />
                    <button onClick={() => addItem(cl.id)} className="btn btn-primary px-4 py-1.5 font-bold text-[10px]">Add</button>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-[var(--border)] flex gap-2">
                <input 
                  type="text" 
                  value={newChecklistTitle} 
                  onChange={e => setNewChecklistTitle(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && createChecklist(card.id, newChecklistTitle).then(cl => { setChecklists(p => [...p, { ...cl, items: [] }]); setNewChecklistTitle(''); })} 
                  placeholder="New Checklist Name..." 
                  className="w-full bg-[var(--bg-list)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl px-4 py-2 text-xs font-bold shadow-inner" 
                />
                <button onClick={() => createChecklist(card.id, newChecklistTitle).then(cl => { setChecklists(p => [...p, { ...cl, items: [] }]); setNewChecklistTitle(''); })} className="bg-black dark:bg-[var(--text-primary)] hover:bg-blue-700 dark:hover:bg-blue-600 text-white dark:text-black hover:dark:text-white px-5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-md">Add Phase</button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
               {activities.length > 0 ? (
                 <div className="space-y-3">
                   {activities.map(act => (
                     <div key={act.id} className="flex gap-3 bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border)] shadow-sm transition-all hover:bg-[var(--bg-list)]">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0 h-fit mt-0.5">
                           <AlignLeft size={14}/>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] text-[var(--text-primary)] leading-snug">
                              <span className="font-black uppercase text-[11px] tracking-tight">{act.action.replace('_', ' ')}</span>
                              {act.details?.title && ` — "${act.details.title}"`}
                              {act.details?.labelId && ` — Label ID ${act.details.labelId}`}
                           </p>
                           <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1 uppercase tracking-widest">{new Date(act.created_at).toLocaleString('en-GB')}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 bg-[var(--bg-list)] rounded-2xl border-2 border-dashed border-[var(--border)]">
                    <div className="flex justify-center mb-4"><Users size={32} className="text-[var(--text-muted)]"/></div>
                    <h5 className="text-[var(--text-primary)] font-black uppercase tracking-widest text-[11px]">No activity history</h5>
                    <p className="text-[var(--text-muted)] text-[10px] mt-1 font-bold">Actions like labels or checklists will appear here.</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none p-4 px-6 border-t border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-between shadow-2xl z-10">
          <button 
            onClick={async () => { if(confirm('Are you sure you want to delete this card?')) { await onDelete(card.id); toast.success('Evolution saved — card deleted'); } }} 
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
          >
            <Trash2 size={14}/> Delete Card
          </button>
          
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 px-6 py-2 transition-all">Cancel</button>
            <button onClick={async () => { setIsSaving(true); try { await onSave({ title, description, due_date: dueDate || null, theme: cardThemeId }); toast.success('Card saved!'); } catch { toast.error('Sync failed — check connection'); } finally { setIsSaving(false); } }} disabled={isSaving || !title.trim()} className="btn btn-primary px-8 py-2.5 font-black uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50">{isSaving ? 'Saving...' : 'Save & Close'}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
