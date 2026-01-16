
"use client";

import React, { useState } from 'react';
import { Search, Filter, MessageCircle, Instagram } from 'lucide-react';
import { Client } from '../../types/index.ts';

interface ConversationListProps {
  conversations: Client[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  selectedId, 
  onSelect 
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  const filtered = conversations.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'Todos' || 
    (filter === 'Não Lidos' && c.unreadCount > 0) ||
    (filter === 'Prioridade' && c.tags?.includes('VIP')))
  );

  return (
    <div className="w-full border-r border-[#F2F0EA] flex flex-col bg-white shrink-0 h-full">
      {/* List Header */}
      <div className="p-6 pb-6 bg-white shrink-0 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-[#333333] tracking-tighter italic">Inbox</h1>
          <button className="w-10 h-10 bg-[#FAF9F6] border border-[#F2F0EA] text-stone-400 hover:text-[#C08A7D] hover:border-[#C08A7D]/20 rounded-xl transition-all flex items-center justify-center">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#C08A7D] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou tag..."
            className="w-full bg-[#FAF9F6] border-2 border-transparent focus:border-[#C08A7D]/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-[#C08A7D]/5 outline-none transition-all placeholder:text-stone-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['Todos', 'Não Lidos', 'Prioridade'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                f === filter 
                  ? 'bg-[#333333] text-white shadow-lg shadow-black/10' 
                  : 'bg-stone-50 text-stone-400 border border-stone-100 hover:border-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-4 pb-12 scrollbar-hide space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-stone-200 shadow-inner">
               <MessageCircle size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 italic mb-2">Sem resultados</p>
            <p className="text-xs text-stone-400 max-w-[150px]">Tente ajustar seus filtros de busca</p>
          </div>
        ) : (
          filtered.map((client, i) => (
            <div 
              key={client.id}
              onClick={() => onSelect(client.id)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`group p-4 rounded-[2rem] flex gap-4 cursor-pointer transition-all duration-300 relative border animate-in slide-in-from-bottom-2 fade-in ${
                selectedId === client.id 
                  ? 'bg-[#FAF9F6] border-[#C08A7D]/20 shadow-lg shadow-[#C08A7D]/5 scale-[1.02]' 
                  : 'bg-white border-transparent hover:bg-stone-50/50 hover:scale-[1.01]'
              }`}
            >
              {/* Active/Unread Indicator */}
              {client.unreadCount > 0 ? (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#C08A7D] rounded-r-full shadow-[0_0_8px_rgba(192,138,125,0.4)]" />
              ) : selectedId === client.id && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-stone-300 rounded-r-full" />
              )}

              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black text-lg italic transition-all duration-300 ${
                  selectedId === client.id ? 'bg-[#C08A7D] text-white shadow-lg' : 'bg-[#FAF9F6] text-stone-300 border border-[#F2F0EA] group-hover:border-[#C08A7D]/20 group-hover:text-[#C08A7D]'
                }`}>
                  {client.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white shadow-md flex items-center justify-center border border-[#F2F0EA]">
                  {client.source === 'whatsapp' ? (
                    <MessageCircle size={10} className="text-emerald-500" />
                  ) : (
                    <Instagram size={10} className="text-pink-500" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-black text-[13px] truncate tracking-tight italic ${selectedId === client.id || client.unreadCount > 0 ? 'text-[#333333]' : 'text-stone-600'}`}>
                    {client.name}
                  </h3>
                  <span className={`text-[8px] uppercase font-black tracking-widest shrink-0 pt-0.5 ${client.unreadCount > 0 ? 'text-[#C08A7D]' : 'text-stone-300'}`}>
                    {client.time}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-[11px] truncate leading-snug flex-1 ${client.unreadCount > 0 ? 'font-bold text-stone-700' : 'text-stone-400 font-medium'}`}>
                    {client.lastMessage}
                  </p>
                  {client.unreadCount > 0 && (
                    <span className="h-4 min-w-[16px] px-1 bg-[#C08A7D] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {client.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
