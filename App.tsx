import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageCircle, Settings, LogOut, Users, Menu } from 'lucide-react';
import { UserProfile, Conversation, Message, IntegrationLog, Customer } from './types';
import { mockGetUserRole } from './services/supabase';
import { DevTools } from './components/DevTools';
import { ChatInterface } from './components/ChatInterface';
import { IntegrationsPanel } from './components/IntegrationsPanel';
import { Button } from './components/ui/Button';

// --- MOCK DATA FOR PREVIEW ---
const MOCK_CUSTOMER: Customer = {
    id: 'c1',
    full_name: 'Mariana Silva',
    email: 'mariana.silva@email.com',
    phone: '5511999999999',
    tiny_contact_id: '123',
    vnda_id: '456'
};

const MOCK_CONVO: Conversation = {
    id: 'conv1',
    customer: MOCK_CUSTOMER,
    source: 'whatsapp',
    last_message: 'Olá, gostaria de saber sobre o vestido...',
    last_message_at: new Date().toISOString(),
    unread_count: 0
};

const MOCK_MESSAGES: Message[] = [
    { id: 'm1', direction: 'inbound', content: 'Olá, tudo bem?', timestamp: new Date(Date.now() - 1000000).toISOString(), status: 'read' },
    { id: 'm2', direction: 'outbound', content: 'Olá Mariana! Tudo ótimo por aqui e com você?', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'read' },
    { id: 'm3', direction: 'inbound', content: 'Tudo bem também! Gostaria de saber se o Vestido Floral ainda tem no tamanho M.', timestamp: new Date(Date.now() - 800000).toISOString(), status: 'read' },
];

// --- APP COMPONENT ---

const App: React.FC = () => {
  // Global State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('chat');
  
  // Chat State
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(MOCK_CONVO);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  
  // Dev State
  const [logs, setLogs] = useState<IntegrationLog[]>([]);

  // Auth Simulation
  const handleLogin = (role: 'user' | 'dev') => {
    setUser({
        id: 'u1',
        email: role === 'dev' ? 'dev@atelieolie.com.br' : 'atendimento@atelieolie.com.br',
        full_name: role === 'dev' ? 'Dev Admin' : 'Atendente Olie',
        role: role
    });
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
        id: crypto.randomUUID(),
        direction: 'outbound',
        content: text,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };
    setMessages([...messages, newMessage]);
    
    // Simulate Meta API Call Log
    if (user?.role === 'dev') {
        setLogs(prev => [{
            id: crypto.randomUUID(),
            service: 'META',
            endpoint: '/messages',
            method: 'POST',
            status_code: 200,
            duration_ms: 124,
            timestamp: new Date().toISOString()
        }, ...prev]);
    }
  };

  const handleIntegrationLog = (log: IntegrationLog) => {
      setLogs(prev => [log, ...prev]);
  };

  // --- RENDER: LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <div className="w-16 h-16 bg-slate-900 rounded-lg mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">O</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">OlieHub V2</h1>
            <p className="text-slate-500 mb-8">Sistema Operacional Centralizado</p>
            
            <div className="space-y-3">
                <Button className="w-full" onClick={() => handleLogin('user')}>
                    Entrar como Atendimento
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Demo Access</span></div>
                </div>
                <Button className="w-full" variant="secondary" onClick={() => handleLogin('dev')}>
                    Simular "DevMode" (Admin)
                </Button>
            </div>
            <p className="mt-6 text-xs text-slate-400">Environment: React SPA (Tailwind + Supabase Mock)</p>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN DASHBOARD ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-16 lg:w-20 bg-slate-900 flex flex-col items-center py-6 gap-6 z-20">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold mb-4">O</div>
        
        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`p-3 rounded-lg flex justify-center transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <LayoutDashboard size={24} />
            </button>
            <button 
                onClick={() => setActiveTab('chat')}
                className={`p-3 rounded-lg flex justify-center transition-all ${activeTab === 'chat' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <MessageCircle size={24} />
            </button>
            <button className="p-3 rounded-lg flex justify-center text-slate-400 hover:text-white">
                <Users size={24} />
            </button>
        </nav>

        <div className="flex flex-col gap-4 w-full px-2">
            <button className="p-3 rounded-lg flex justify-center text-slate-400 hover:text-white">
                <Settings size={24} />
            </button>
            <button onClick={() => setUser(null)} className="p-3 rounded-lg flex justify-center text-slate-400 hover:text-red-400">
                <LogOut size={24} />
            </button>
        </div>
      </aside>

      {/* Main Content Area - Split View */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Chat List (Hidden on mobile if chat active, simplified for demo) */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
            <div className="p-4 border-b border-slate-100 font-bold text-lg flex justify-between items-center">
                Mensagens
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">12 Open</span>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div 
                    className="p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-purple-600 bg-purple-50"
                    onClick={() => setSelectedConversation(MOCK_CONVO)}
                >
                    <div className="flex justify-between mb-1">
                        <span className="font-semibold text-slate-900">Mariana Silva</span>
                        <span className="text-xs text-slate-400">10:45</span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">Gostaria de saber se o Vestido...</p>
                    <div className="mt-2 flex gap-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">WhatsApp</span>
                    </div>
                </div>
                {/* Dummy items */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent">
                        <div className="flex justify-between mb-1">
                            <span className="font-semibold text-slate-700">Cliente {i}</span>
                            <span className="text-xs text-slate-400">Yesterday</span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">Olá, meu pedido já foi enviado?</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Center Column: Active Chat */}
        <div className="flex-1 flex flex-col min-w-[350px] border-r border-slate-200">
            {selectedConversation ? (
                <ChatInterface 
                    conversation={selectedConversation} 
                    messages={messages} 
                    onSendMessage={handleSendMessage}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
                    Selecione uma conversa
                </div>
            )}
        </div>

        {/* Right Column: Context Panel (Integrations) */}
        <div className="w-96 hidden xl:block">
            {selectedConversation && (
                <IntegrationsPanel 
                    customer={selectedConversation.customer} 
                    onLog={handleIntegrationLog}
                />
            )}
        </div>

      </main>

      {/* DevMode Overlay */}
      {user.role === 'dev' && <DevTools logs={logs} />}
    </div>
  );
};

export default App;
