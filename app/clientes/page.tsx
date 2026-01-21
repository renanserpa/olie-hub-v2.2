
"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Star, TrendingUp, Mail, Phone, Plus, Heart, Award, Diamond, Loader2, RefreshCcw } from 'lucide-react';
import { ClientDetailDrawer } from '../../components/clientes/client-detail-drawer.tsx';
import { useSearch } from '../../contexts/SearchContext.tsx';
import { Customer } from '../../types/index.ts';
import { CustomerService, SyncService } from '../../services/api.ts';
import { DataAlert } from '../../components/shared/data-alert.tsx';
import { toast } from 'sonner';

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [activeSegment, setActiveSegment] = useState<'Todos' | 'VIP' | 'Leads'>('Todos');
  const { searchTerm } = useSearch();

  const { 
    data: response = { data: [], error: null }, 
    isLoading, 
    isFetching 
  } = useQuery({
    queryKey: ['customers'],
    queryFn: () => CustomerService.getList(),
  });

  const clients = response.data || [];
  
  const handleSync = async () => {
    const toastId = toast.loading("Sincronizando com o ERP...");
    try {
      await SyncService.syncCustomers();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Base de clientes atualizada", { id: toastId });
    } catch (err) {
      toast.error("Falha na sincronização", { id: toastId });
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.phone?.includes(searchTerm);
      const matchesSegment = activeSegment === 'Todos' || 
                            (activeSegment === 'VIP' && c.ltv > 2000) || 
                            (activeSegment === 'Leads' && c.total_orders === 0);
      return matchesSearch && matchesSegment;
    });
  }, [searchTerm, activeSegment, clients]);

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-stone-50">
       <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 text-olie-500 animate-spin" />
          <p className="font-serif italic text-stone-300 text-lg">Mapeando base de relacionamento...</p>
       </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col overflow-hidden h-full bg-[#FAF9F6]">
      <header className="h-24 px-12 flex items-center justify-between bg-white border-b border-stone-100 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
           <Diamond className="text-olie-500" size={24} />
           <h1 className="text-3xl font-serif italic text-olie-900 tracking-tighter leading-none">Diretório de Relacionamento</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-olie-500 transition-colors" size={16} />
            <div className="bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black uppercase text-stone-400 tracking-widest min-w-64">
              {searchTerm || 'Filtro Global Ativo'}
            </div>
          </div>
          <button 
            onClick={handleSync}
            disabled={isFetching}
            className="w-12 h-12 flex items-center justify-center bg-stone-50 border border-stone-100 rounded-2xl text-stone-400 hover:text-olie-500 transition-all"
          >
            <RefreshCcw size={20} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <div className="h-8 w-px bg-stone-100" />
          <button className="h-12 px-6 bg-olie-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-olie-500/20 flex items-center gap-2 hover:bg-olie-600 transition-all">
            <Plus size={16} />
            Novo Registro
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-12 space-y-12 max-w-7xl mx-auto w-full">
        
        <DataAlert error={response.error} context="Base de Clientes (Supabase)" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-stone-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
             <div className="absolute -right-12 -top-12 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12">
                <Award size={240} />
             </div>
             <div className="relative z-10 space-y-8">
               <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.4em]">Equity da Base</span>
               <h2 className="text-5xl font-serif italic leading-none">R$ {(clients.reduce((acc, c) => acc + (c.ltv || 0), 0) / (clients.length || 1)).toFixed(0)} <span className="text-sm text-emerald-400 not-italic font-sans ml-2">+12.4%</span></h2>
               <p className="text-xs text-stone-400 font-medium leading-relaxed italic">Base VIP em expansão orgânica qualificada.</p>
             </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-8">
             <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-olie-soft space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">Novos Leads</span>
                  <div className="w-8 h-8 rounded-xl bg-olie-50 text-olie-500 flex items-center justify-center"><TrendingUp size={14}/></div>
                </div>
                <h3 className="text-4xl font-serif italic text-olie-900">+{clients.length} Ativos</h3>
                <div className="w-full h-1 bg-stone-50 rounded-full overflow-hidden">
                   <div className="h-full bg-olie-500 w-[65%] animate-in slide-in-from-left duration-1000" />
                </div>
             </div>
             <div className="bg-olie-50/30 p-10 rounded-[3rem] border border-olie-100/50 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-olie-300 uppercase tracking-[0.4em]">Recorrência</span>
                  <Heart className="text-olie-500 fill-olie-500/20" size={18} />
                </div>
                <h3 className="text-4xl font-serif italic text-olie-900">68.2%</h3>
                <p className="text-[10px] font-black text-olie-500 uppercase tracking-widest bg-white/60 px-3 py-1.5 rounded-xl w-fit">Customer Love Index</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
          <div className="flex p-1.5 bg-white border border-stone-100 rounded-2xl shadow-sm">
            {['Todos', 'VIP', 'Leads'].map(seg => (
              <button 
                key={seg} 
                onClick={() => setActiveSegment(seg as any)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSegment === seg ? 'bg-olie-900 text-white shadow-lg' : 'text-stone-300 hover:text-stone-500'}`}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {filteredClients.length > 0 ? filteredClients.map((client, i) => (
            <div 
              key={client.id} 
              onClick={() => setSelectedClient(client)}
              className="bg-white p-10 rounded-[3.5rem] border border-stone-100 shadow-olie-soft hover:shadow-olie-lg hover:-translate-y-2 transition-all duration-700 cursor-pointer group relative overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {(client.ltv || 0) > 3000 && (
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-olie-50 rounded-full flex items-center justify-center p-6 text-olie-500/20 group-hover:text-olie-500/40 transition-colors">
                  <Star size={40} className="rotate-12" />
                </div>
              )}

              <div className="flex justify-between items-start mb-10">
                <div className="w-20 h-20 rounded-[2.5rem] bg-stone-50 border border-stone-100 flex items-center justify-center font-serif text-3xl italic text-olie-500 group-hover:bg-olie-900 group-hover:text-white transition-all duration-700 shadow-sm relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-tr from-olie-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <span className="relative z-10">{client.full_name.charAt(0)}</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-stone-50 rounded-xl text-stone-300 hover:text-olie-500 hover:bg-white transition-all flex items-center justify-center shadow-sm"><Mail size={16}/></button>
                  <button className="w-10 h-10 bg-stone-50 rounded-xl text-stone-300 hover:text-olie-500 hover:bg-white transition-all flex items-center justify-center shadow-sm"><Phone size={16}/></button>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-2xl font-serif italic text-stone-900 leading-tight group-hover:text-olie-500 transition-colors">{client.full_name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest italic">{client.channel_source}</span>
                  <div className="w-1 h-1 rounded-full bg-stone-200" />
                  <span className="text-[10px] font-bold text-stone-400">Desde Jun/23</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-50 flex justify-between items-center">
                 <div>
                    <p className="text-[9px] font-black uppercase text-stone-300 tracking-[0.2em] mb-1">Lifetime Value</p>
                    <p className="text-xl font-black text-stone-800">R$ {client.ltv?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                 </div>
                 <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                    {client.tags.slice(0, 2).map(t => (
                      <span key={t} className="px-3 py-1 bg-stone-50 rounded-lg text-[8px] font-black text-stone-400 uppercase tracking-widest">{t}</span>
                    ))}
                 </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-stone-50 group-hover:bg-olie-500 transition-colors" />
            </div>
          )) : (
            <div className="col-span-full py-40 text-center opacity-30 italic font-serif">
              <Users size={48} strokeWidth={1} className="mb-4 mx-auto" />
              <p className="text-xl">Nenhum cliente encontrado para "{searchTerm}".</p>
            </div>
          )}
        </div>
      </div>

      <ClientDetailDrawer 
        client={selectedClient} 
        isOpen={!!selectedClient} 
        onClose={() => setSelectedClient(null)} 
      />
    </main>
  );
}
