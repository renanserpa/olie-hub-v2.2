
"use client";

import React from 'react';
import { 
  X, Mail, Phone, MapPin, Calendar, 
  ShoppingBag, Star, Heart, MessageSquare,
  TrendingUp, Tag, ChevronRight, ExternalLink
} from 'lucide-react';
import { Customer } from '../../types/index.ts';

interface ClientDetailDrawerProps {
  client: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({ client, isOpen, onClose }) => {
  if (!client) return null;

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      <aside className={`absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          
          <header className="h-24 px-8 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Perfil do Cliente</span>
              <h2 className="text-2xl font-serif italic text-olie-900">CRM Premium</h2>
            </div>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-stone-50 text-stone-400 hover:text-olie-500 transition-all">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide pb-24">
            
            {/* Main Info */}
            <section className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-olie-500 flex items-center justify-center text-white text-4xl font-serif italic shadow-olie-lg">
                {client.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-serif italic text-olie-900">{client.full_name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">{client.channel_source}</p>
              </div>
              <div className="flex justify-center gap-2">
                {client.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-stone-400">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-stone-50 rounded-3xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">LTV Total</p>
                <p className="text-xl font-serif italic font-bold text-olie-900">R$ {client.ltv?.toFixed(2) || '0,00'}</p>
              </div>
              <div className="p-6 bg-stone-50 rounded-3xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Pedidos</p>
                <p className="text-xl font-serif italic font-bold text-olie-900">{client.total_orders}</p>
              </div>
            </section>

            {/* Contact Details */}
            <section className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-stone-300 border-b border-stone-100 pb-2">Contato</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-white border border-stone-100 rounded-2xl">
                  <Mail size={16} className="text-stone-300" />
                  <span className="text-xs font-medium text-stone-600">{client.email}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border border-stone-100 rounded-2xl">
                  <Phone size={16} className="text-stone-300" />
                  <span className="text-xs font-medium text-stone-600">{client.phone}</span>
                </div>
              </div>
            </section>

            {/* Purchase History Preview */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-stone-300">Histórico Recente</h4>
                <button className="text-[9px] font-black uppercase text-olie-500">Ver Todos</button>
              </div>
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 p-4 hover:bg-stone-50 rounded-2xl transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-800">Bolsa Lille KTA</p>
                      <p className="text-[9px] text-stone-400 font-black uppercase">Finalizado • 12/08/2023</p>
                    </div>
                    <ChevronRight size={16} className="text-stone-200 group-hover:text-olie-500 self-center" />
                  </div>
                ))}
              </div>
            </section>

          </div>

          <footer className="p-6 border-t border-stone-100 bg-white grid grid-cols-2 gap-4 shrink-0">
             <button className="flex items-center justify-center gap-2 h-14 bg-stone-100 text-stone-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-all">
               <MessageSquare size={14} />
               Abrir Chat
             </button>
             <button className="flex items-center justify-center gap-2 h-14 bg-olie-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-stone-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
               <TrendingUp size={14} />
               Criar Oferta
             </button>
          </footer>
        </div>
      </aside>
    </div>
  );
};
