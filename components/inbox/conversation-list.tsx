
"use client";

import React, { useState } from 'react';
import { Search, Filter, MessageCircle, Instagram } from 'lucide-react';
import { Client, ChannelSource } from '../../types/index.ts';

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
    c.name.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Buscar..."
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
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-200">
               <MessageCircle size={28} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 italic">Vazio</p>
          </div>
        ) : (
          filtered.map(client => (
            <div 
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={`group p-4 rounded-[2rem] flex gap-4 cursor-pointer transition-all duration-300 relative border ${
                selectedId === client.id 
                  ? 'bg-[#FAF9F6] border-[#C08A7D]/20 shadow-lg shadow-[#C08A7D]/5' 
                  : 'bg-white border-transparent hover:bg-stone-50/50'
              }`}
            >
              {/* Active Indicator */}
              {client.unreadCount > 0 && selectedId !== client.id && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#C08A7D] rounded-full" />
              )}

              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black text-lg italic transition-all duration-300 ${
                  selectedId === client.id ? 'bg-[#C08A7D] text-white shadow-lg' : 'bg-[#FAF9F6] text-stone-300 border border-[#F2F0EA]'
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
                  <h3 className={`font-black text-[13px] truncate tracking-tight italic ${selectedId === client.id ? 'text-[#333333]' : 'text-stone-600'}`}>
                    {client.name}
                  </h3>
                  <span className="text-[8px] text-stone-300 uppercase font-black tracking-widest shrink-0 pt-0.5">
                    {client.time}
                  </span>
                </div>
                <p className={`text-[11px] truncate leading-snug ${client.unreadCount > 0 && selectedId !== client.id ? 'font-bold text-[#333333]' : 'text-stone-400 font-medium'}`}>
                  {client.lastMessage}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
