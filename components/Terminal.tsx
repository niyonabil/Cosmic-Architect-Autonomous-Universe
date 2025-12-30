
import React, { useState } from 'react';
import { LogEntry } from '../types';
import { interpretOrder } from '../services/geminiService';
import { Terminal as TerminalIcon, Send, Loader2, Sparkles } from 'lucide-react';

interface Props {
  logs: LogEntry[]; // Kept for prop compatibility, but not rendered in minimal mode
  onOrder: (order: any) => void;
}

export const Terminal: React.FC<Props> = ({ onOrder }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    setInput('');
    setIsProcessing(true);

    // Call Gemini to translate natural language order
    const order = await interpretOrder(command);
    if (order && order.CONSTRAINTS?.PHYSICS_SAFE !== false) {
      onOrder(order);
    } else {
      console.warn("Command rejected: Violation of physical laws or uninterpretable.");
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="w-full">
        <form onSubmit={handleSubmit} className="relative group">
             {/* Glow Effect */}
             <div className={`absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all rounded-full opacity-0 ${isProcessing ? 'opacity-100 animate-pulse' : 'group-hover:opacity-100'}`} />
             
             {/* Input Container */}
             <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-full px-4 py-3 shadow-2xl ring-1 ring-white/10 focus-within:ring-blue-500/50 transition-all">
                <span className={`mr-3 transition-colors ${isProcessing ? 'text-amber-400' : 'text-blue-500'}`}>
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <TerminalIcon size={18} />}
                </span>
                
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isProcessing ? "Transmitting to Cosmos..." : "Enter cosmic order..."}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-blue-100 placeholder:text-slate-500 font-mono"
                  disabled={isProcessing}
                />
                
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50">
                    <div className="hidden group-focus-within:flex items-center gap-1.5 pr-2">
                        <Sparkles size={10} className="text-purple-400 animate-pulse" />
                        <span className="text-[9px] text-purple-300 font-bold tracking-wider opacity-80">AI READY</span>
                    </div>
                    <button 
                    type="submit"
                    disabled={isProcessing || !input.trim()}
                    className={`p-1.5 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isProcessing ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white'}`}
                    >
                    <Send size={14} />
                    </button>
                </div>
             </div>
        </form>
    </div>
  );
};
