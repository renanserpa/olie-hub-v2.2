
import React, { useState, useEffect } from 'react';
import { Terminal, X, Activity, Database, Server } from 'lucide-react';
// Fix: Import IntegrationLog from types/index.ts to resolve module missing member error
import { IntegrationLog } from '../types/index';

interface DevToolsProps {
  logs: IntegrationLog[];
}

export const DevTools: React.FC<DevToolsProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'env'>('logs');

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 z-50 border-2 border-white transition-all"
        title="OlieHub DevMode"
      >
        <Terminal size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-[600px] h-[400px] bg-slate-900 text-slate-300 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-700 font-mono text-xs">
      {/* Header */}
      <div className="bg-slate-950 p-2 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">DEV MODE</span>
          <span className="font-semibold">System Diagnostics</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900">
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'logs' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
        >
          <Activity size={14} /> Live Logs
        </button>
        <button 
          onClick={() => setActiveTab('env')}
          className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'env' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
        >
          <Database size={14} /> Env & State
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-slate-900">
        {activeTab === 'logs' && (
          <div className="space-y-2">
            {logs.length === 0 && <p className="text-slate-600 italic">No activity logs yet...</p>}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 border-b border-slate-800 pb-1 mb-1 font-mono">
                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`font-bold ${
                  log.service === 'TINY' ? 'text-blue-400' : 
                  log.service === 'VNDA' ? 'text-orange-400' : 'text-green-400'
                }`}>{log.service}</span>
                <span className={log.status_code >= 400 ? 'text-red-400' : 'text-green-300'}>
                  {log.method} {log.endpoint}
                </span>
                <span className="ml-auto text-slate-500">{log.duration_ms}ms</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'env' && (
          <div className="space-y-4">
             <div>
                <h4 className="text-purple-400 font-bold mb-1 flex items-center gap-2"><Server size={12}/> Connection Status</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800 p-2 rounded flex justify-between">
                        <span>Supabase Auth</span>
                        <span className="text-green-400">Connected</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded flex justify-between">
                        <span>Tiny ERP API</span>
                        <span className="text-yellow-400">Mocked</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded flex justify-between">
                        <span>VNDA API</span>
                        <span className="text-yellow-400">Mocked</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded flex justify-between">
                        <span>Meta Graph API</span>
                        <span className="text-red-400">Disconnected</span>
                    </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
