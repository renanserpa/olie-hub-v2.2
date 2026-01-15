import React, { useState } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone } from 'lucide-react';
import { Conversation, Message } from '../types';

interface ChatInterfaceProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversation, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      {/* Header */}
      <div className="bg-slate-100 px-4 py-3 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-lg">
            {conversation.customer.full_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{conversation.customer.full_name}</h3>
            <span className="text-xs text-slate-500">
              {conversation.source === 'whatsapp' ? 'WhatsApp Business' : 'Instagram DM'}
            </span>
          </div>
        </div>
        <div className="flex gap-4 text-slate-500">
            <button className="hover:text-slate-800"><Phone size={20}/></button>
            <button className="hover:text-slate-800"><MoreVertical size={20}/></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm text-sm ${
                msg.direction === 'outbound' 
                  ? 'bg-green-100 text-slate-900 rounded-tr-none' 
                  : 'bg-white text-slate-900 rounded-tl-none'
              }`}
            >
              <p>{msg.content}</p>
              <div className="text-[10px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.direction === 'outbound' && (
                    <span className={msg.status === 'read' ? 'text-blue-400' : 'text-slate-400'}>✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-slate-100 p-3 flex items-center gap-2 border-t border-slate-200">
        <button type="button" className="text-slate-500 hover:text-slate-700 p-2">
            <Smile size={24} />
        </button>
        <button type="button" className="text-slate-500 hover:text-slate-700 p-2">
            <Paperclip size={24} />
        </button>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 rounded-lg border-none px-4 py-2 focus:ring-1 focus:ring-slate-300 bg-white"
        />
        <button 
            type="submit" 
            className={`p-3 rounded-full transition-all ${inputText.trim() ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400'}`}
            disabled={!inputText.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
