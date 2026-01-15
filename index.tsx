
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Inbox, ShoppingBag, Kanban, DollarSign, Package, Settings, 
  Search, User, Zap, Send, Phone, MoreVertical, X, Trash2, 
  CheckCircle2, Loader2, ChevronRight, Ghost, Instagram, 
  MessageCircle, Facebook, Mail, Pin, PanelRightOpen, 
  PanelRightClose, Image as ImageIcon, Palette, Sparkles, MapPin, 
  Clock, AlertCircle, ShoppingCart, History, UserCircle2,
  Eye, ChevronLeft
} from 'lucide-react';

// --- BRAND CONSTANTS ---
const BRAND_PRIMARY = "#C08A7D"; // Dusty Rose
const BRAND_CHARCOAL = "#333333"; // Dark Charcoal
const BRAND_CREAM = "#FAF9F6"; // Background Cream

// --- TYPES ---
type ChannelSource = 'whatsapp' | 'instagram' | 'facebook' | 'pinterest' | 'email';
type ConvoStatus = 'bot_triage' | 'queue' | 'assigned' | 'closed';
type ConvoStage = 'cobrar' | 'passar_pedido' | 'producao' | 'enviado' | 'entregue';
type SidebarTab = 'crm' | 'catalog' | 'orders';
type ProductCategory = 'bolsas' | 'necessaires' | 'viagem' | 'acessórios';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  source: ChannelSource;
}

interface Conversation {
  id: string;
  customer: Customer;
  source: ChannelSource;
  last_message: string;
  last_message_at: string;
  status: ConvoStatus;
  stage: ConvoStage;
  assignee_id: string | null;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  type: 'text' | 'image';
  direction: 'inbound' | 'outbound';
  timestamp: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: ProductCategory;
  image?: string;
  origin: 'Tiny' | 'VNDA';
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado';
}

// --- MOCK SERVICES LAYER ---
const mockServices = {
  tiny: {
    getOrders: async (customerId: string): Promise<Order[]> => {
      await new Promise(r => setTimeout(r, 800)); 
      if (customerId === 'cust-1') {
        return [
          { id: 'TNY-9982', date: '2023-11-20', total: 450.00, status: 'Processando' },
          { id: 'TNY-8821', date: '2023-10-15', total: 159.90, status: 'Entregue' }
        ];
      }
      return [];
    }
  },
  vnda: {
    getCatalog: async (): Promise<Product[]> => {
      return [
        { id: 'p1', name: 'Bolsa Lille Couro - M', sku: 'OL-VF-M', price: 450.00, stock: 12, category: 'bolsas', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', origin: 'VNDA' },
        { id: 'p2', name: 'Mini Bag Terracota', sku: 'OL-MB-T', price: 289.00, stock: 5, category: 'bolsas', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80', origin: 'VNDA' },
        { id: 'p3', name: 'Necessaire Box G', sku: 'OL-NB-G', price: 159.90, stock: 8, category: 'necessaires', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80', origin: 'Tiny' },
        { id: 'p4', name: 'Necessaire Flat Slim', sku: 'OL-NF-S', price: 89.00, stock: 15, category: 'necessaires', image: 'https://images.unsplash.com/photo-1594465919760-442ee32a9a7a?w=400&q=80', origin: 'Tiny' },
        { id: 'p5', name: 'Mala de Viagem Lille', sku: 'OL-MV-L', price: 890.00, stock: 3, category: 'viagem', image: 'https://images.unsplash.com/photo-1544816153-199d88f6573d?w=400&q=80', origin: 'VNDA' },
        { id: 'p6', name: 'Tag de Mala Personalizada', sku: 'OL-TM-P', price: 45.00, stock: 50, category: 'acessórios', image: 'https://images.unsplash.com/photo-1623998021451-306e53f136be?w=400&q=80', origin: 'Tiny' },
        { id: 'p7', name: 'Carteira de Couro Slim', sku: 'OL-CC-S', price: 129.00, stock: 20, category: 'acessórios', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80', origin: 'VNDA' },
        { id: 'p8', name: 'Kit Viagem Premium', sku: 'OL-KV-P', price: 1200.00, stock: 2, category: 'viagem', image: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?w=400&q=80', origin: 'VNDA' },
      ];
    }
  },
  crm: {
    getCustomer: async (id: string): Promise<Customer | null> => {
      const customers: Record<string, Customer> = {
        'cust-1': { id: 'cust-1', full_name: 'Mariana Silva', email: 'mari@gmail.com', phone: '11999999999', source: 'whatsapp' },
        'cust-2': { id: 'cust-2', full_name: 'Ana Carla', email: 'ana@gmail.com', phone: '11888888888', source: 'instagram' },
      };
      return customers[id] || null;
    }
  }
};

const CHANNEL_CONFIG: Record<ChannelSource, { icon: any, color: string, label: string }> = {
  whatsapp: { icon: MessageCircle, color: "bg-emerald-500", label: "WhatsApp" },
  instagram: { icon: Instagram, color: "bg-gradient-to-tr from-purple-600 to-pink-500", label: "Instagram" },
  facebook: { icon: Facebook, color: "bg-blue-600", label: "Messenger" },
  pinterest: { icon: Pin, color: "bg-rose-600", label: "Pinterest" },
  email: { icon: Mail, color: "bg-slate-400", label: "E-mail" }
};

// --- COMPONENTS ---

const Sidebar = ({ activeView, setView }: any) => (
  <aside className="w-20 bg-[#FAF9F6] flex flex-col items-center py-8 border-r border-stone-200 shrink-0 z-50">
    <div className="w-12 h-12 bg-[#C08A7D] rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-12 shadow-lg shadow-[#C08A7D]/20 cursor-pointer hover:scale-105 transition-all">O</div>
    <nav className="flex-1 flex flex-col gap-6">
      <button onClick={() => setView('inbox')} className={`p-3 rounded-xl transition-all ${activeView === 'inbox' ? 'bg-[#C08A7D] text-white shadow-lg shadow-[#C08A7D]/20' : 'text-stone-400 hover:text-[#C08A7D]'}`}>
        <Inbox size={24} />
      </button>
      <button className="p-3 text-stone-400 hover:text-[#C08A7D] transition-all"><ShoppingBag size={24} /></button>
      <button className="p-3 text-stone-400 hover:text-[#C08A7D] transition-all"><Kanban size={24} /></button>
    </nav>
    <div className="mt-auto flex flex-col gap-6 items-center">
      <button onClick={() => setView('settings')} className={`p-3 rounded-xl transition-all ${activeView === 'settings' ? 'bg-[#333333] text-white shadow-lg' : 'text-stone-400 hover:text-[#333333]'}`}>
        <Settings size={24} />
      </button>
    </div>
  </aside>
);

const QuickViewModal = ({ product, onClose, onSend }: { product: Product, onClose: () => void, onSend: any }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
        <div className="md:w-1/2 aspect-square relative group">
          <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-[#C08A7D] shadow-sm">
            {product.origin}
          </div>
        </div>
        <div className="flex-1 p-10 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">{product.category}</span>
              <h2 className="text-3xl font-black text-[#333333] leading-tight">{product.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-stone-300 hover:text-[#C08A7D] transition-colors"><X size={24} /></button>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-[#C08A7D]">R$ {product.price.toFixed(2)}</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Detalhes do Produto</p>
              <div className="p-4 bg-stone-50 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold"><span className="text-stone-400">SKU:</span> <span>{product.sku}</span></div>
                <div className="flex justify-between text-xs font-bold"><span className="text-stone-400">Origem:</span> <span>{product.origin}</span></div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-10">
            <button 
              onClick={() => { onSend(product.image, 'image'); onClose(); }}
              className="flex-1 bg-[#C08A7D] text-white py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-[#C08A7D]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> Enviar no Chat
            </button>
            <button 
              onClick={() => onClose()}
              className="px-8 bg-stone-100 text-stone-400 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-stone-200 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [activeView, setActiveView] = useState<'inbox' | 'settings'>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [contextTab, setContextTab] = useState<SidebarTab>('crm');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);

  // Load Initial Data
  useEffect(() => {
    const load = async () => {
      const prods = await mockServices.vnda.getCatalog();
      setCatalog(prods);
      
      const c1 = await mockServices.crm.getCustomer('cust-1');
      const c2 = await mockServices.crm.getCustomer('cust-2');
      if (c1 && c2) {
        setConversations([
          {
            id: 'c-1',
            source: 'whatsapp',
            status: 'assigned',
            stage: 'cobrar',
            assignee_id: 'agent-1',
            last_message: 'Pode confirmar meu tamanho?',
            last_message_at: new Date().toISOString(),
            unread_count: 0,
            customer: c1
          },
          {
            id: 'c-2',
            source: 'instagram',
            status: 'bot_triage',
            stage: 'cobrar',
            assignee_id: 'agent-2',
            last_message: '🤖 Olá! Como posso ajudar?',
            last_message_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            unread_count: 1,
            customer: c2
          }
        ]);
      }
    };
    load();
  }, []);

  const activeConv = useMemo(() => conversations.find(c => c.id === selectedId), [conversations, selectedId]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text') => {
    if (!selectedId || !content.trim()) return;
    const newMsg: Message = {
      id: Math.random().toString(),
      conversation_id: selectedId,
      content,
      type,
      direction: 'outbound',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const openTab = (tab: SidebarTab) => {
    setIsSidebarOpen(true);
    setContextTab(tab);
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-[#333333] overflow-hidden font-sans antialiased">
      <Sidebar activeView={activeView} setView={setActiveView} />

      <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9F6]">
        <div className="h-20 border-b border-stone-200 flex items-center justify-between px-10 bg-white shrink-0 z-40">
           <h1 className="text-xl font-black tracking-tight text-[#333333]">OlieHub V2</h1>
           <div className="flex items-center gap-4">
             <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
               <button className="px-4 py-2 bg-white text-[#C08A7D] shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest">Inbox</button>
               <button className="px-4 py-2 text-stone-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Kanban</button>
             </div>
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-stone-200 flex flex-col bg-white overflow-y-auto scrollbar-hide">
            {conversations.map(c => (
              <div key={c.id} onClick={() => setSelectedId(c.id)} className={`p-6 border-b border-stone-50 cursor-pointer relative transition-all ${selectedId === c.id ? 'bg-[#F4F1EA]/50' : 'hover:bg-[#FAF9F6]'}`}>
                {selectedId === c.id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#C08A7D] rounded-r-full" />}
                <h4 className="font-bold text-sm text-[#333333] mb-1">{c.customer.full_name}</h4>
                <p className="text-xs text-stone-500 truncate italic">"{c.last_message}"</p>
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col bg-white relative">
            {activeConv ? (
               <ChatWindow 
                activeConv={activeConv} 
                messages={messages} 
                handleSendMessage={handleSendMessage} 
                onOpenTab={openTab}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                scrollRef={scrollRef}
               />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 p-20 text-center">
                <Inbox size={100} className="text-[#F4F1EA] mb-6" />
                <h2 className="text-2xl font-black">Workspace Olie</h2>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${isSidebarOpen ? 'w-[400px]' : 'w-0'} border-l border-stone-200 flex flex-col shrink-0 bg-white shadow-2xl z-40 transition-all duration-300 overflow-hidden`}>
         <div className="flex border-b border-stone-100 p-1 min-w-[400px]">
            {[
              { id: 'crm', label: 'CRM', icon: UserCircle2 },
              { id: 'catalog', label: 'Catálogo', icon: ShoppingCart },
              { id: 'orders', label: 'Pedidos', icon: History },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setContextTab(tab.id as SidebarTab)}
                className={`flex-1 py-5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${contextTab === tab.id ? 'border-[#C08A7D] text-[#C08A7D]' : 'border-transparent text-stone-300 hover:text-stone-500'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
         </div>

         <div className="flex-1 min-w-[400px] overflow-y-auto scrollbar-hide bg-[#FAF9F6]/30">
            {activeConv ? (
              <div className="h-full">
                {contextTab === 'crm' && <CRMView customer={activeConv.customer} />}
                {contextTab === 'catalog' && <CatalogView products={catalog} onSend={handleSendMessage} />}
                {contextTab === 'orders' && <OrdersView customerId={activeConv.customer.id} />}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 p-20 grayscale">
                 <Ghost size={80} className="mb-8 animate-bounce" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-center">Selecione uma conversa</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

// --- SUB-VIEWS FOR SIDEBAR ---

const CRMView = ({ customer }: { customer: Customer }) => {
  const channel = CHANNEL_CONFIG[customer.source];
  
  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4">
      <div className="text-center">
        <div className="w-24 h-24 rounded-[2.5rem] bg-white border-4 border-stone-50 flex items-center justify-center text-4xl font-black text-[#C08A7D] mx-auto mb-6 shadow-xl relative">
          {customer.full_name.charAt(0)}
          <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl ${channel.color} flex items-center justify-center text-white border-4 border-white shadow-lg`}>
            <channel.icon size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-[#333333] tracking-tight">{customer.full_name}</h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="px-3 py-1 bg-stone-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-1">
            <MapPin size={10} /> São Paulo, BR
          </span>
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white ${channel.color} flex items-center gap-1 shadow-sm`}>
            {channel.label}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">Informações de Contato</h3>
        <div className="p-5 bg-white rounded-3xl border border-stone-100 space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400"><Phone size={16}/></div>
            <div><p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Telefone</p><p className="font-bold text-sm text-stone-700">{customer.phone}</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400"><Mail size={16}/></div>
            <div><p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">E-mail</p><p className="font-bold text-sm text-stone-700">{customer.email}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">Tags e Contexto</h3>
        <div className="flex flex-wrap gap-2">
          {['Cliente VIP', 'Lille Lover', 'Hardware Ouro', 'Recompra'].map(tag => (
            <span key={tag} className="px-4 py-2 bg-stone-100 text-stone-500 rounded-2xl text-[10px] font-bold border border-stone-200/50">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const CatalogView = ({ products, onSend }: { products: Product[], onSend: any }) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const ITEMS_PER_PAGE = 4;

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search]);

  const categories: { id: ProductCategory | 'all', label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'bolsas', label: 'Bolsas' },
    { id: 'necessaires', label: 'Necessaires' },
    { id: 'viagem', label: 'Viagem' },
    { id: 'acessórios', label: 'Acessórios' },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
      {/* Header with Search and Categories */}
      <div className="p-8 border-b border-stone-100 space-y-6 shrink-0 bg-white sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-stone-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 focus:ring-[#C08A7D]/10 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-[#C08A7D] text-white shadow-lg shadow-[#C08A7D]/20' : 'bg-stone-100 text-stone-400 hover:text-stone-600 hover:bg-stone-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 p-8 space-y-6 min-h-0">
        {paginated.length > 0 ? paginated.map(p => (
          <div key={p.id} className="group bg-white rounded-[2.5rem] border border-stone-100 p-5 hover:shadow-2xl hover:border-[#C08A7D]/20 transition-all">
            <div className="flex gap-6">
              <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 border border-stone-50 shadow-inner relative group/img">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-in-out" alt={p.name} />
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-sm ${p.origin === 'VNDA' ? 'bg-orange-500 text-white' : 'bg-[#333333] text-white'}`}>
                  {p.origin}
                </div>
                <button 
                  onClick={() => setQuickViewProduct(p)}
                  className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Eye size={24} />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-[#333333] text-sm leading-tight group-hover:text-[#C08A7D] transition-colors">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-black text-[#C08A7D] uppercase tracking-tighter">R$ {p.price.toFixed(2)}</span>
                    <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">• {p.sku}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => onSend(p.image || '', 'image')}
                    className="flex-1 bg-stone-50 hover:bg-[#C08A7D] hover:text-white text-stone-400 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn shadow-sm"
                  >
                    <Send size={14} className="group-hover/btn:scale-110" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Enviar</span>
                  </button>
                  <button 
                    onClick={() => setQuickViewProduct(p)}
                    className="flex-1 bg-stone-50 hover:bg-[#333333] hover:text-white text-stone-400 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn shadow-sm"
                  >
                    <Eye size={14} className="group-hover/btn:scale-110" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Ver</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <Search size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-8 border-t border-stone-100 flex items-center justify-between shrink-0 bg-white">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-3 bg-stone-50 text-stone-400 rounded-xl disabled:opacity-30 hover:bg-stone-100 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#C08A7D] text-white shadow-lg shadow-[#C08A7D]/20' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-3 bg-stone-50 text-stone-400 rounded-xl disabled:opacity-30 hover:bg-stone-100 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
          onSend={onSend}
        />
      )}
    </div>
  );
};

const OrdersView = ({ customerId }: { customerId: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockServices.tiny.getOrders(customerId).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [customerId]);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-20 gap-4 opacity-40">
      <Loader2 size={32} className="animate-spin text-[#C08A7D]" />
      <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Tiny ERP...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Histórico Tiny</h3>
        <span className="text-[10px] font-black text-[#C08A7D] uppercase tracking-widest underline cursor-pointer">Ver Tudo</span>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-[2rem] border border-stone-100 p-6 hover:shadow-lg transition-all border-l-4 border-l-[#C08A7D]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-black text-[#333333] mb-1">{o.id}</p>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {new Date(o.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${o.status === 'Entregue' ? 'bg-emerald-500 text-white' : 'bg-[#C08A7D] text-white'}`}>
                  {o.status}
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-stone-50">
                <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">Valor Total</span>
                <span className="text-xl font-black text-[#333333]">R$ {o.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-dashed border-stone-200 p-12 text-center">
           <AlertCircle size={32} className="mx-auto text-stone-100 mb-4" />
           <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-relaxed">Nenhum pedido encontrado<br/>no Tiny para este cliente.</p>
        </div>
      )}

      <button className="w-full bg-white border-2 border-stone-100 text-stone-400 font-black py-5 rounded-[2.2rem] flex items-center justify-center gap-4 hover:border-[#C08A7D]/30 hover:text-[#C08A7D] transition-all group shadow-sm">
        <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" /> Criar Novo Orçamento
      </button>
    </div>
  );
};

// --- CHAT WINDOW COMPONENT ---

const ChatWindow = ({ activeConv, messages, handleSendMessage, onOpenTab, isSidebarOpen, setIsSidebarOpen, scrollRef }: any) => {
  const [inputText, setInputText] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  
  const getChannel = (source: ChannelSource) => CHANNEL_CONFIG[source] || CHANNEL_CONFIG.whatsapp;
  const channel = getChannel(activeConv.source);

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col relative h-full bg-[#FAF9F6]">
      <div className="h-24 border-b border-stone-100 flex items-center justify-between px-10 bg-white/95 backdrop-blur-xl z-[45] shrink-0">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center text-white relative shadow-xl ${channel.color}`}>
             <span className="text-2xl font-black">{activeConv.customer.full_name.charAt(0)}</span>
             <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-800 border-2 border-white shadow-sm ring-2 ring-white">
                <channel.icon size={14} className={`${channel.color.replace('bg-', 'text-')}`}/>
             </div>
          </div>
          <div>
            <h3 className="font-black text-[#333333] text-lg leading-tight tracking-tight">{activeConv.customer.full_name}</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#C08A7D] mt-1">Conectado via {channel.label}</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 text-stone-300 hover:text-[#C08A7D] hover:bg-stone-50 rounded-2xl transition-all">
           {isSidebarOpen ? <PanelRightClose size={24} /> : <PanelRightOpen size={24} />}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 pb-44 space-y-2 bg-[#FAF9F6] scrollbar-hide z-10">
        {messages.map((m: Message) => (
          <div key={m.id} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}>
            <div className={`max-w-[70%] flex flex-col ${m.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
              <div className={`group relative transition-all hover:shadow-md ${
                m.type === 'image' 
                  ? 'p-1 bg-white border border-stone-200 rounded-[2rem]' 
                  : `px-6 py-4 rounded-[2rem] text-[14px] leading-relaxed shadow-sm ${
                      m.direction === 'outbound' 
                        ? 'bg-[#C08A7D] text-white rounded-tr-none' 
                        : 'bg-white border border-stone-200 rounded-tl-none text-[#333333]'
                    }`
              }`}>
                {m.type === 'image' ? <img src={m.content} className="w-64 h-64 object-cover rounded-[1.8rem]" /> : m.content}
              </div>
              <span className="text-[9px] font-black text-stone-300 uppercase mt-2 px-3">{m.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-0 right-0 px-12 z-[50]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
           <div className="w-full bg-white/95 backdrop-blur-2xl rounded-[3rem] p-3 shadow-2xl border border-stone-100 flex items-center gap-4 relative z-50">
              
              {isActionsOpen && (
                <div className="absolute bottom-full left-4 mb-4 w-64 bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 p-4 animate-in slide-in-from-bottom-4 duration-300 z-[100]">
                   <p className="px-3 pb-4 pt-1 text-[9px] font-black text-stone-300 uppercase tracking-widest border-b border-stone-50">Ações Inteligentes</p>
                   <button onClick={() => { onOpenTab('catalog'); setIsActionsOpen(false); }} className="w-full text-left px-4 py-3 mt-2 hover:bg-[#F4F1EA] rounded-2xl flex items-center gap-4 group transition-all">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover:text-[#C08A7D] transition-all"><ShoppingCart size={18} /></div>
                      <span className="text-xs font-bold text-[#333333]">Abrir Catálogo</span>
                   </button>
                   <button onClick={() => { onOpenTab('orders'); setIsActionsOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#F4F1EA] rounded-2xl flex items-center gap-4 group transition-all">
                      <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover:text-[#C08A7D] transition-all"><History size={18} /></div>
                      <span className="text-xs font-bold text-[#333333]">Ver Pedidos Tiny</span>
                   </button>
                </div>
              )}

              <div className="flex items-center gap-1 pl-3 text-stone-300">
                <button 
                  onClick={() => setIsActionsOpen(!isActionsOpen)} 
                  className={`p-3 rounded-2xl transition-all ${isActionsOpen ? 'bg-[#C08A7D] text-white shadow-lg shadow-[#C08A7D]/20' : 'hover:text-[#C08A7D] hover:bg-stone-50'}`}
                >
                   <Zap size={24} fill={isActionsOpen ? "currentColor" : "none"} />
                </button>
                <button className="p-3 hover:text-[#C08A7D] hover:bg-stone-50 rounded-2xl transition-all" onClick={() => onOpenTab('catalog')}>
                   <ImageIcon size={24} />
                </button>
              </div>

              <form onSubmit={submitForm} className="flex-1 flex items-center gap-4">
                <input 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Responder para Mariana..." 
                  className="flex-1 bg-transparent border-none text-[15px] font-medium outline-none focus:ring-0 placeholder:text-stone-300 text-[#333333]" 
                />
                <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="w-14 h-14 bg-[#C08A7D] text-white rounded-[1.8rem] flex items-center justify-center hover:scale-[1.02] active:scale-90 transition-all shadow-xl shadow-[#C08A7D]/20 disabled:opacity-20 disabled:grayscale"
                  >
                    <Send size={24} />
                </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
