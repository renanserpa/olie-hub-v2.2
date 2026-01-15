"use client";

import React, { useState } from 'react';
import { Search, Filter, MessageCircle, Instagram } from 'lucide-react';
import { Client, ChannelSource } from '../../types/index';

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
    <div className="w-[420px] border-r border-[#F2F0EA] flex flex-col bg-white shrink-0 h-full">
      {/* List Header */}
      <div className="p-10 pb-8 bg-white shrink-0 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-[#333333] tracking-tighter italic">Inbox</h1>
          <button className="w-12 h-12 bg-[#FAF9F6] border border-[#F2F0EA] text-stone-400 hover:text-[#C08A7D] hover:border-[#C08A7D]/20 rounded-2xl transition-all flex items-center justify-center">
            <Filter size={20} />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#C08A7D] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou pedido..."
            className="w-full bg-[#FAF9F6] border-2 border-transparent focus:border-[#C08A7D]/10 rounded-3xl pl-16 pr-6 py-5 text-sm font-medium focus:ring-[12px] focus:ring-[#C08A7D]/5 outline-none transition-all placeholder:text-stone-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['Todos', 'Não Lidos', 'Prioridade'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                f === filter 
                  ? 'bg-[#333333] text-white shadow-xl shadow-black/10' 
                  : 'bg-stone-50 text-stone-400 border border-stone-100 hover:border-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide space-y-4">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
               <MessageCircle size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 italic">Vazio em Silêncio</p>
          </div>
        ) : (
          filtered.map(client => (
            <div 
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={`group p-6 rounded-[2.8rem] flex gap-6 cursor-pointer transition-all duration-500 relative border-2 ${
                selectedId === client.id 
                  ? 'bg-[#FAF9F6] border-[#C08A7D]/20 shadow-xl shadow-[#C08A7D]/5 translate-x-2' 
                  : 'bg-white border-transparent hover:bg-stone-50/50'
              }`}
            >
              {/* Active Indicator */}
              {client.unreadCount > 0 && selectedId !== client.id && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-8 bg-[#C08A7D] rounded-full shadow-[0_0_15px_rgba(192,138,125,0.6)]" />
              )}

              <div className="relative shrink-0">
                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center font-black text-xl italic transition-all duration-500 ${
                  selectedId === client.id ? 'bg-[#C08A7D] text-white shadow-2xl' : 'bg-[#FAF9F6] text-stone-300 border border-[#F2F0EA]'
                }`}>
                  {client.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-white shadow-lg flex items-center justify-center border border-[#F2F0EA]">
                  {client.source === 'whatsapp' ? (
                    <MessageCircle size={14} className="text-emerald-500" />
                  ) : (
                    <Instagram size={14} className="text-pink-500" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className={`font-black text-[15px] truncate tracking-tight italic ${selectedId === client.id ? 'text-[#333333]' : 'text-stone-600'}`}>
                    {client.name}
                  </h3>
                  <span className="text-[9px] text-stone-300 uppercase font-black tracking-widest shrink-0 pt-1">
                    {client.time}
                  </span>
                </div>
                <p className={`text-[13px] truncate leading-snug ${client.unreadCount > 0 && selectedId !== client.id ? 'font-bold text-[#333333]' : 'text-stone-400 font-medium'}`}>
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