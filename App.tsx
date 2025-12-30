
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UniverseEngine } from './engine/UniverseEngine';
import { CosmosVisualizer } from './components/CosmosVisualizer';
import { Terminal } from './components/Terminal';
import { Dashboard } from './components/Dashboard';
import { EntityList } from './components/EntityList';
import { EventLog } from './components/EventLog';
import { ChatInterface } from './components/ChatInterface';
import { DocumentaryModal } from './components/DocumentaryModal';
import { SimulationState, LogEntry, SimulationNotification, Entity, EntityType } from './types';
import { interpretOrder, interactWithCivilization } from './services/geminiService';
import { ZoomIn, ZoomOut, Maximize, Bell, X, Crosshair, LayoutDashboard, Database, Target, FileText } from 'lucide-react';

const engine = new UniverseEngine();

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>(engine.getState());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  // Default zoom set to 0.12 (12%) for Global Universe View
  const [zoom, setZoom] = useState(0.12);
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'DATABASE'>('DASHBOARD');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);

  const update = useCallback(() => {
    if (!isPaused) {
      engine.tick();
      const newState = engine.getState();
      setState(newState);
      setLogs(engine.getLogs());
    }
    requestRef.current = requestAnimationFrame(update);
  }, [isPaused]);

  // Initial Contact Trigger
  useEffect(() => {
      if (state.isContactEstablished && state.chatHistory.length === 0 && !isChatProcessing) {
          handleChat("INIT_CONTACT"); // Trigger initial greeting
      }
  }, [state.isContactEstablished]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  const handleStart = () => {
    engine.bigBang();
  };

  const handleOrder = (order: any) => {
    engine.applyOrder(order);
  };

  const handleChat = async (text: string) => {
      const entity = engine.getContactEntity();
      if (!entity) return;

      setIsChatProcessing(true);
      
      // If not init, add user message locally first
      if (text !== "INIT_CONTACT") {
        engine.addChatMessage('USER', text);
        setState(engine.getState());
      }
      
      const response = await interactWithCivilization(
          entity, 
          state.chatHistory, 
          text === "INIT_CONTACT" ? undefined : text
      );

      engine.addChatMessage('CIVILIZATION', response);
      setState(engine.getState());
      setIsChatProcessing(false);
  };

  const adjustZoom = (factor: number) => {
    setZoom(prev => Math.min(Math.max(prev * factor, 0.01), 10000));
  };

  const clearNotification = (id: string) => {
    engine.clearNotification(id);
    setState(engine.getState());
  };

  const resetTracking = () => {
    engine.setTracking(undefined);
    engine.setViewOffset(0, 0); // Go back to universe center
    setState(engine.getState());
  };

  const handleSetCenter = (x: number, y: number) => {
    engine.setTracking(undefined); // Stop following specific entity
    engine.setViewOffset(x, y); // Set manual center
    setState(engine.getState());
  };

  const handleEntitySelect = (entity: Entity) => {
    // 1. Set Tracking ID in Engine
    engine.setTracking(entity.id);
    
    // 2. Force View Offset to entity coordinates immediately (Centering)
    engine.setViewOffset(entity.x, entity.y);

    setState(engine.getState());
    
    // Auto-zoom logic based on entity type for best view
    let targetZoom = 1.0;
    if (entity.type === EntityType.GALAXY) targetZoom = 1.5; // Closer galaxy view
    else if (entity.type === EntityType.STAR) targetZoom = 8.0;
    else if (entity.type === EntityType.PLANET || entity.type === EntityType.MOON) targetZoom = 45.0;
    else if (entity.type === EntityType.BLACK_HOLE) targetZoom = 6.0;
    
    // If it has life, zoom in even closer to "inspect" the details
    if (entity.bio) targetZoom = 80.0;

    setZoom(targetZoom);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-mono selection:bg-blue-500/30">
      {/* Notifications Overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {state.notifications.map((n) => (
          <div 
            key={n.id} 
            className="pointer-events-auto bg-slate-900/90 backdrop-blur border border-blue-500/50 p-4 rounded-lg shadow-2xl animate-in slide-in-from-right w-80 relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${n.type === 'earth' ? 'bg-emerald-500' : n.type === 'life' ? 'bg-green-400' : 'bg-blue-500'}`} />
            <button 
              onClick={() => clearNotification(n.id)}
              className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Bell size={18} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{n.title}</h4>
                <p className="text-xs text-slate-200 leading-relaxed">{n.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DocumentaryModal isOpen={isDocOpen} onClose={() => setIsDocOpen(false)} />

      {/* Left Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/60 backdrop-blur-md z-10 shadow-xl h-full">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 shrink-0">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent italic tracking-tighter">
            COSMIC ARCHITECT
          </h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Universe Engine</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-500 font-bold">ONLINE</span>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex p-2 gap-1 border-b border-slate-800 shrink-0 bg-slate-950/30">
            <button 
                onClick={() => setViewMode('DASHBOARD')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold tracking-wider transition-all ${viewMode === 'DASHBOARD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            >
                <LayoutDashboard size={12} /> DASHBOARD
            </button>
            <button 
                onClick={() => setViewMode('DATABASE')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold tracking-wider transition-all ${viewMode === 'DATABASE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            >
                <Database size={12} /> DATABASE
            </button>
        </div>

        {/* Main Sidebar Content - Fixed Flex Parent */}
        <div className="flex-1 min-h-0 flex flex-col">
          {viewMode === 'DASHBOARD' ? (
              <div className="overflow-y-auto p-4 scrollbar-hide h-full">
                <Dashboard state={state} />
              </div>
          ) : (
              <EntityList 
                  entities={state.entities} 
                  onSelect={handleEntitySelect} 
                  trackedId={state.trackedEntityId} 
              />
          )}
        </div>

        {/* Fixed Command Hub */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Crosshair size={12} /> Command Hub
                </h3>
                <div className="flex items-center gap-2">
                   <button 
                        onClick={() => setIsDocOpen(true)}
                        className="text-[9px] text-blue-400 hover:text-white flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-500/30 transition-all"
                    >
                        <FileText size={10} /> DOCS
                    </button>
                    {state.trackedEntityId && (
                        <button 
                            onClick={resetTracking}
                            className="text-[9px] text-blue-400 hover:text-white flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                        >
                            <X size={10} /> CLEAR TRACKING
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleStart}
                disabled={state.isBigBangOccurred}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale rounded text-[10px] font-black tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/20"
              >
                BIG BANG
              </button>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`px-3 py-2 rounded text-[10px] font-black tracking-widest transition-all active:scale-95 shadow-lg ${isPaused ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}
              >
                {isPaused ? 'RESUME' : 'FREEZE'}
              </button>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button 
                  onClick={() => { resetTracking(); setZoom(0.12); }} // Reset to Global View
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-all active:scale-90 text-slate-400 hover:text-white"
                  title="Global View"
                >
                  <Target size={14} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-[10px] font-black text-blue-400 tracking-tighter">{(zoom * 100).toFixed(0)}%</span>
                </div>
                <button 
                  onClick={() => adjustZoom(0.7)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-all active:scale-90 text-slate-400 hover:text-white"
                >
                  <ZoomOut size={14} />
                </button>
                <button 
                  onClick={() => adjustZoom(1.4)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-all active:scale-90 text-slate-400 hover:text-white border-l border-slate-700 ml-1"
                >
                  <ZoomIn size={14} />
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-800 bg-black text-[9px] text-slate-600 flex justify-between items-center font-mono shrink-0">
          <span>V3.8-GLOBAL-VIEW</span>
          <span className="text-slate-800">|</span>
          <span>S_ARCH: {state.stats.highestLifeStage}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col min-w-0">
        <div className="flex-1 relative bg-black cursor-crosshair overflow-hidden">
           {state.isBigBangOccurred ? (
             <CosmosVisualizer 
                state={state} 
                zoomLevel={zoom} 
                onZoomChange={setZoom} 
                onSetCenter={handleSetCenter}
             />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center flex-col space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 animate-ping absolute inset-0" />
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-blue-400 font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Awaiting First Impulse</p>
                  <p className="text-slate-600 text-[9px] max-w-xs px-4">Initialize the Big Bang sequence to begin the 13.8 billion year simulation.</p>
                </div>
             </div>
           )}
           
           {/* Precise Center Indicator */}
           {state.isBigBangOccurred && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
               <div className="w-8 h-px bg-white/50" />
               <div className="h-8 w-px bg-white/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               <div className="w-2 h-2 border border-white/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             </div>
           )}
           
           {/* Event Log Bar - Bottom Center */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] max-w-[50vw] z-40 pointer-events-none">
              <EventLog logs={logs} />
           </div>

           {/* Floating Terminal Input - Bottom Right */}
           <div className="absolute bottom-6 right-6 w-[400px] max-w-[30vw] z-40">
              <Terminal logs={logs} onOrder={handleOrder} />
           </div>

           {/* CHAT INTERFACE - FLOATING TOP LEFT */}
           {state.isContactEstablished && engine.getContactEntity() && (
             <div className="absolute top-4 left-4 z-40">
                <ChatInterface 
                    entity={engine.getContactEntity()!} 
                    history={state.chatHistory}
                    onSendMessage={handleChat}
                    isProcessing={isChatProcessing}
                />
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default App;
