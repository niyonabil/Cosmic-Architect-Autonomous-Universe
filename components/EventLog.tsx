
import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Info, AlertTriangle, AlertOctagon, Terminal, Activity, Radio, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  logs: LogEntry[];
}

export const EventLog: React.FC<Props> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const latest = logs[0];

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'critical': return <AlertOctagon size={14} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'bio': return <Activity size={14} className="text-emerald-500" />;
      case 'order': return <Terminal size={14} className="text-blue-500" />;
      case 'cosmic': return <Radio size={14} className="text-purple-500" />;
      default: return <Info size={14} className="text-slate-500" />;
    }
  };

  const getStyles = (type: LogEntry['type']) => {
    switch (type) {
      case 'critical': return 'border-red-500/30 bg-red-950/40 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'warning': return 'border-amber-500/30 bg-amber-950/40 text-amber-200';
      case 'bio': return 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'order': return 'border-blue-500/30 bg-blue-950/40 text-blue-200';
      case 'cosmic': return 'border-purple-500/30 bg-purple-950/40 text-purple-200';
      default: return 'border-slate-700 bg-slate-900/60 text-slate-300';
    }
  };

  if (!latest && isExpanded) return (
    <div className="w-full flex flex-col items-center">
        <div className="w-full h-10 flex items-center justify-center text-[10px] text-slate-600 font-mono tracking-widest uppercase opacity-50 backdrop-blur-sm bg-slate-950/30 border border-slate-800 rounded-lg">
            <span className="animate-pulse">Awaiting Cosmic Events...</span>
        </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center transition-all duration-500 ease-in-out">
         {/* Main Log Box */}
         <div 
            className={`w-full transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none h-0'}`}
         >
             {latest && (
                <div 
                    key={latest.timestamp}
                    className={`w-full px-4 py-2.5 rounded-lg flex items-center gap-4 border backdrop-blur-md ${getStyles(latest.type)}`}
                >
                    <div className="shrink-0 animate-pulse">{getIcon(latest.type)}</div>
                    
                    <div className="h-4 w-px bg-current opacity-20 shrink-0" />
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 overflow-hidden">
                        <span className="text-[9px] font-mono opacity-60 shrink-0">
                            T+{(latest.timestamp % 100000).toString().padStart(5, '0')}
                        </span>
                        <span className="text-xs font-mono font-bold truncate tracking-tight uppercase">
                            {latest.message}
                        </span>
                    </div>
                </div>
             )}
         </div>

         {/* Toggle Handle */}
         <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 hover:bg-slate-800 hover:border-slate-500 transition-all shadow-lg backdrop-blur text-[10px] uppercase font-bold text-slate-400 hover:text-white group z-50`}
         >
            {isExpanded ? (
                <>
                    <span>Collapse Log</span>
                    <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        {latest && <div className="animate-pulse">{getIcon(latest.type)}</div>}
                        <span className="max-w-[200px] truncate">{latest ? latest.message : "Events"}</span>
                    </div>
                    <ChevronUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
                </>
            )}
         </button>
    </div>
  );
};
