
"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
// Fix: Import Client from the correct types/index.ts location
import { Client } from '../../types/index';

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
    <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0 h-full">
      <div className="p-5 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-bold mb-4">Inbox Olie</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cliente..."
            className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-600/20 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {['Todos', 'Não Lidos', 'Produção'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                f === filter ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filtered.map(client => (
          <div 
            key={client.id}
            onClick={() => onSelect(client.id)}
            className={`p-4 flex gap-3 cursor-pointer transition-all border-b border-slate-100 relative ${
              selectedId === client.id ? 'bg-white shadow-sm z-10' : 'hover:bg-slate-100'
            }`}
          >
            {selectedId === client.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600" />
            )}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                {client.avatar}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="font-semibold text-sm truncate">{client.name}</h3>
                <span className="text-[10px] text-slate-400 uppercase font-bold">{client.time}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{client.lastMessage}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  client.source === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {client.source}
                </span>
                {client.unreadCount > 0 && (
                  <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
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
