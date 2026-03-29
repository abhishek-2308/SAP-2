'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Layout, X, Calendar, AlignLeft, CheckSquare, Users, Tag, Trash2, Plus, ArrowRight, Paperclip, FileText, Download, Check } from 'lucide-react';
import { getCardLabels, getAllLabels, addCardLabel, removeCardLabel, getCardMembers, getAllUsers, assignCardMember, removeCardMember, getCardChecklists, createChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem, getActivities, getAttachments, uploadAttachment, deleteAttachment } from '@/lib/api';
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#091e42a3] transition-all" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 5 }} className="relative bg-[#f1f2f4] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-300">
        
        {/* Simple Header */}
        <div className="flex-none p-6 flex items-start justify-between bg-white border-b border-slate-200">
          <div className="flex-1 pr-6 flex items-center gap-3">
            <Layout size={20} className="text-slate-500 mt-1" />
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent text-lg font-black text-slate-800 hover:bg-black/5 focus:bg-white focus:ring-2 focus:ring-blue-600 rounded px-2 py-1 outline-none transition-all placeholder:text-slate-400" />
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-black/5 rounded-lg transition-all"><X size={20}/></button>
        </div>

        {/* Action Tabs */}
        <div className="flex px-6 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[ 'details', 'labels', 'members', 'attachments', 'checklists', 'activity' ].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={cn("px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all shrink-0", activeTab === t ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800')}>{t}</button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={14}/> Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add more context..." rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none shadow-inner" />
              <div className="w-64">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 mb-2"><Calendar size={14}/> Target Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" />
              </div>
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="grid grid-cols-2 gap-3">
              {allLabels.map(l => (
                <button key={l.id} onClick={() => toggleLabel(l.id)} className={cn("flex items-center gap-3 p-4 rounded-xl border-2 transition-all shadow-sm", labels.some(cl => cl.id === l.id) ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50')}>
                  <div className="w-10 h-5 rounded-full shadow-inner" style={{ backgroundColor: l.color }} />
                  <span className="text-xs font-black uppercase tracking-tight text-slate-800">{l.name}</span>
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
                      className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all", isAssigned ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 bg-white hover:border-slate-300')}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300">{u.name.charAt(0)}</div>
                      <div className="flex-1 text-left">
                         <div className="text-sm font-bold text-slate-800">{u.name}</div>
                         <div className="text-[10px] text-slate-500">{u.email}</div>
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
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Paperclip size={14}/> Attachments</h4>
                    <label className={cn("btn btn-primary px-4 py-1.5 font-bold text-[10px] cursor-pointer", isUploading && "opacity-50 pointer-events-none")}>
                        {isUploading ? 'Uploading...' : 'Upload File'}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading}/>
                    </label>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                   {attachments.length > 0 ? attachments.map(att => (
                     <div key={att.id} className="group flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                           <FileText size={24}/>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-black text-slate-800 truncate">{att.original_name}</div>
                           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                              {(att.size / 1024).toFixed(1)} KB • {new Date(att.created_at).toLocaleDateString()}
                           </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/uploads/${att.filename}`} download={att.original_name} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Download size={16}/>
                           </a>
                           <button onClick={() => deleteAttachment(att.id).then(() => { setAttachments(p => p.filter(a => a.id !== att.id)); getActivities(null, card.id).then(setActivities); })} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16}/>
                           </button>
                        </div>
                     </div>
                   )) : (
                     <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Paperclip size={24} className="mx-auto text-slate-300 mb-2"/>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">No attachments yet</p>
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
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                       <CheckSquare size={16} className="text-blue-600"/>
                       {cl.title}
                    </h4>
                    <button onClick={() => deleteChecklist(cl.id).then(() => setChecklists(p => p.filter(c => c.id !== cl.id)))} className="text-slate-400 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                  </div>
                  
                  <div className="space-y-2 pl-6 border-l-2 border-slate-100 ml-2">
                    {cl.items.map(i => (
                      <div key={i.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-400 transition-all cursor-pointer shadow-sm group" onClick={() => toggleChecklistItem(i.id).then(it => setChecklists(p => p.map(cl => cl.id === it.checklist_id ? { ...cl, items: cl.items.map(item => item.id === it.id ? it : item) } : cl)))}>
                        <div className={cn("w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center", i.is_completed ? 'bg-green-600 border-green-600 shadow-sm' : 'border-slate-300')}>
                          {i.is_completed && <Check size={12} className="text-white font-black"/>}
                        </div>
                        <span className={cn("flex-1 text-sm font-medium", i.is_completed ? 'text-slate-400 line-through' : 'text-slate-800')}>
                          {i.content}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); deleteChecklistItem(i.id).then(() => setChecklists(p => p.map(cl2 => cl2.id === i.checklist_id ? { ...cl2, items: cl2.items.filter(it => it.id !== i.id) } : cl2))); }} className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner" 
                    />
                    <button onClick={() => addItem(cl.id)} className="btn btn-primary px-4 py-1.5 font-bold text-[10px]">Add</button>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-slate-300 flex gap-2">
                <input 
                  type="text" 
                  value={newChecklistTitle} 
                  onChange={e => setNewChecklistTitle(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && createChecklist(card.id, newChecklistTitle).then(cl => { setChecklists(p => [...p, { ...cl, items: [] }]); setNewChecklistTitle(''); })} 
                  placeholder="New Checklist Name..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold shadow-inner" 
                />
                <button onClick={() => createChecklist(card.id, newChecklistTitle).then(cl => { setChecklists(p => [...p, { ...cl, items: [] }]); setNewChecklistTitle(''); })} className="bg-black hover:bg-blue-700 text-white px-5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-md">Add Phase</button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
               {activities.length > 0 ? (
                 <div className="space-y-3">
                   {activities.map(act => (
                     <div key={act.id} className="flex gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm transition-all hover:bg-slate-50">
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 shrink-0 h-fit mt-0.5">
                           <AlignLeft size={14}/>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[13px] text-slate-800 leading-snug">
                              <span className="font-black uppercase text-[11px] tracking-tight">{act.action.replace('_', ' ')}</span>
                              {act.details?.title && ` — "${act.details.title}"`}
                              {act.details?.labelId && ` — Label ID ${act.details.labelId}`}
                           </p>
                           <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(act.created_at).toLocaleString('en-GB')}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="flex justify-center mb-4"><Users size={32} className="text-slate-300"/></div>
                    <h5 className="text-slate-800 font-black uppercase tracking-widest text-[11px]">No activity history</h5>
                    <p className="text-slate-500 text-[10px] mt-1 font-bold">Actions like labels or checklists will appear here.</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-between shadow-2xl z-10">
          <button 
            onClick={async () => { if(confirm('Are you sure you want to delete this card?')) { await onDelete(card.id); toast.success('Evolution saved — card deleted'); } }} 
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            <Trash2 size={14}/> Delete Card
          </button>
          
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 px-6 py-2 transition-all">Cancel</button>
            <button onClick={async () => { setIsSaving(true); try { await onSave({ title, description, due_date: dueDate || null }); toast.success('Evolution synced successfully'); } catch { toast.error('Sync failed — check connection'); } finally { setIsSaving(false); } }} disabled={isSaving || !title.trim()} className="btn btn-primary px-8 py-2.5 font-black uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50">{isSaving ? 'Syncing...' : 'Save & Close'}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
