
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
    (filter === 'Todos' || (filter === 'Não Lidos' && c.unreadCount > 0))
  );

  return (
    <div className="w-full border-r border-stone-100 flex flex-col bg-white h-full relative z-10">
      <div className="p-8 pb-6 bg-white shrink-0 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif italic text-olie-900 tracking-tight">Inbox</h1>
          <button className="w-11 h-11 bg-stone-50 border border-stone-100 text-stone-400 hover:text-olie-500 hover:border-olie-500/20 rounded-2xl transition-all flex items-center justify-center">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar atendimento..."
            className="w-full bg-stone-50 border border-stone-100 focus:border-olie-500/20 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-semibold focus:ring-4 focus:ring-olie-500/5 outline-none transition-all placeholder:text-stone-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['Todos', 'Não Lidos', 'Prioridade'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                f === filter 
                  ? 'bg-olie-900 text-white border-olie-900 shadow-lg' 
                  : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-12 scrollbar-hide space-y-2">
        {filtered.map((client, i) => (
          <div 
            key={client.id}
            onClick={() => onSelect(client.id)}
            style={{ animationDelay: `${i * 40}ms` }}
            className={`group p-4 rounded-[2rem] flex gap-4 cursor-pointer transition-all duration-300 relative border animate-in slide-in-from-bottom-2 fade-in ${
              selectedId === client.id 
                ? 'bg-stone-50 border-stone-100 shadow-olie-soft scale-[1.02]' 
                : 'bg-white border-transparent hover:bg-stone-50/50'
            }`}
          >
            {client.unreadCount > 0 && (
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-olie-500 rounded-r-full shadow-lg shadow-olie-500/40" />
            )}

            <div className="relative shrink-0">
              <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-serif text-xl italic transition-all duration-500 ${
                selectedId === client.id ? 'bg-olie-500 text-white shadow-lg' : 'bg-stone-50 text-stone-300 border border-stone-100 group-hover:text-olie-500 group-hover:border-olie-500/20'
              }`}>
                {client.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-white shadow-md flex items-center justify-center border border-stone-100">
                {client.source === 'whatsapp' ? (
                  <MessageCircle size={12} className="text-emerald-500" />
                ) : (
                  <Instagram size={12} className="text-pink-500" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-black text-[13px] truncate tracking-tight italic ${client.unreadCount > 0 ? 'text-olie-900' : 'text-stone-600'}`}>
                  {client.name}
                </h3>
                <span className="text-[8px] uppercase font-black tracking-widest text-stone-300 shrink-0">
                  {client.time}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <p className={`text-[11px] truncate leading-snug flex-1 ${client.unreadCount > 0 ? 'font-bold text-stone-800' : 'text-stone-400 font-medium italic'}`}>
                  {client.lastMessage}
                </p>
                {client.unreadCount > 0 && (
                  <span className="h-4 min-w-[16px] px-1 bg-olie-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {client.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
