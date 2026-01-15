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
    <div className="w-[380px] border-r border-stone-200 flex flex-col bg-white shrink-0 h-full">
      {/* Header da Lista */}
      <div className="p-8 pb-6 bg-white shrink-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-[#333333] tracking-tight italic">Inbox</h1>
          <button className="p-2.5 bg-stone-50 text-stone-400 hover:text-[#C08A7D] rounded-xl transition-all">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-[#C08A7D] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar atendimento..."
            className="w-full bg-stone-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-[#C08A7D]/5 outline-none transition-all placeholder:text-stone-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide">
          {['Todos', 'Não Lidos', 'Prioridade', 'Encerrados'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                f === filter 
                  ? 'bg-[#333333] text-white border-[#333333] shadow-lg shadow-black/10' 
                  : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide space-y-2">
        {filtered.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <MessageCircle size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filtered.map(client => (
            <div 
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={`group p-5 rounded-[2.2rem] flex gap-4 cursor-pointer transition-all duration-300 relative border ${
                selectedId === client.id 
                  ? 'bg-[#FAF9F6] border-[#C08A7D]/20 shadow-xl shadow-[#C08A7D]/5 translate-x-1' 
                  : 'bg-white border-transparent hover:bg-stone-50/50'
              }`}
            >
              {/* Unread Indicator dot */}
              {client.unreadCount > 0 && selectedId !== client.id && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#C08A7D] rounded-full shadow-[0_0_10px_rgba(192,138,125,0.6)] animate-pulse" />
              )}

              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center font-black text-lg transition-all ${
                  selectedId === client.id ? 'bg-[#C08A7D] text-white shadow-lg' : 'bg-stone-100 text-stone-400'
                }`}>
                  {client.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center border border-stone-100">
                  {client.source === 'whatsapp' ? (
                    <MessageCircle size={12} className="text-emerald-500" />
                  ) : (
                    <Instagram size={12} className="text-pink-500" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-black text-sm truncate tracking-tight italic ${selectedId === client.id ? 'text-[#333333]' : 'text-stone-600'}`}>
                    {client.name}
                  </h3>
                  <span className="text-[9px] text-stone-300 uppercase font-black tracking-tighter shrink-0 ml-2 pt-0.5">
                    {client.time}
                  </span>
                </div>
                <p className={`text-xs truncate ${client.unreadCount > 0 && selectedId !== client.id ? 'font-bold text-stone-800' : 'text-stone-400 font-medium'}`}>
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