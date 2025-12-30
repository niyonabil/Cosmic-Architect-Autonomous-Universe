
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Entity } from '../types';
import { Radio, Send, User, Bot, Loader2 } from 'lucide-react';

interface Props {
  entity: Entity;
  history: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<Props> = ({ entity, history, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="w-[350px] bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-lg overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="p-3 bg-emerald-950/50 border-b border-emerald-500/20 flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-full animate-pulse">
            <Radio size={16} className="text-emerald-400" />
        </div>
        <div>
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Incoming Transmission</h3>
            <p className="text-[9px] text-slate-400 font-mono">SOURCE: {entity.name || entity.id}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 h-[300px] overflow-y-auto p-4 space-y-4 bg-slate-950/50 font-mono text-xs">
         {history.length === 0 && (
             <div className="text-center text-slate-600 italic text-[10px] mt-10">
                 Secure channel established.<br/>Waiting for entity response...
             </div>
         )}
         {history.map(msg => (
             <div key={msg.id} className={`flex gap-2 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                 <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${msg.sender === 'USER' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                     {msg.sender === 'USER' ? <User size={12} /> : <Bot size={12} />}
                 </div>
                 <div className={`p-2 rounded max-w-[80%] ${msg.sender === 'USER' ? 'bg-blue-900/30 text-blue-100' : 'bg-emerald-900/30 text-emerald-100'}`}>
                     {msg.text}
                 </div>
             </div>
         ))}
         {isProcessing && (
             <div className="flex gap-2">
                 <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-emerald-600">
                     <Bot size={12} />
                 </div>
                 <div className="flex items-center gap-1 p-2 bg-emerald-900/20 rounded text-emerald-500">
                     <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                     <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                     <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                 </div>
             </div>
         )}
         <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
         <input 
            className="flex-1 bg-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Reply to civilization..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isProcessing}
         />
         <button 
            type="submit" 
            disabled={isProcessing || !input.trim()}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50"
         >
            <Send size={14} />
         </button>
      </form>
    </div>
  );
};
