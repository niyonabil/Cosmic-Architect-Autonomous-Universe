
import React from 'react';
import { SimulationState, LifeStage, CosmicEpoch } from '../types';
import { Activity, Zap, Globe, Hourglass, Sun, Star, Layers, Users, CircleDot, Orbit, Beaker, Pickaxe, Cpu, Leaf } from 'lucide-react';

interface Props {
  state: SimulationState;
}

export const Dashboard: React.FC<Props> = ({ state }) => {
  const formatAge = (years: number) => {
    if (years < 1000) return `${years} Y`;
    if (years < 1_000_000) return `${(years / 1000).toFixed(1)} KY`;
    if (years < 1_000_000_000) return `${(years / 1_000_000).toFixed(1)} MA`;
    return `${(years / 1_000_000_000).toFixed(3)} GA`;
  };

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num < 1_000_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num < 1_000_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`;
    return `${(num / 1_000_000_000_000_000).toFixed(1)}Qa`;
  };

  const stats = [
    { label: 'REAL AGE', value: formatAge(state.realAge), icon: <Hourglass size={14} />, color: 'text-blue-400' },
    { label: 'EPOCH', value: state.cosmicEpoch.replace(/_/g, ' '), icon: <Sun size={14} />, color: 'text-amber-400' },
    { label: 'GALAXIES', value: formatNumber(state.stats.totalGalaxies), icon: <Orbit size={14} />, color: 'text-purple-400' },
    { label: 'STARS', value: formatNumber(state.stats.totalStars), icon: <Star size={14} />, color: 'text-yellow-400' },
    { label: 'PLANETS', value: formatNumber(state.stats.totalPlanets), icon: <Globe size={14} />, color: 'text-emerald-400' },
    { label: 'BIOSPHERES', value: formatNumber(state.stats.totalBiospheres), icon: <Leaf size={14} />, color: 'text-green-500' },
    { label: 'BLACK HOLES', value: formatNumber(state.stats.totalBlackHoles), icon: <CircleDot size={14} />, color: 'text-fuchsia-500' },
    { label: 'CIVILIZATIONS', value: state.stats.activeCivilizations, icon: <Users size={14} />, color: 'text-indigo-400' },
    { label: 'DEBRIS', value: state.stats.totalAsteroids, icon: <Zap size={14} />, color: 'text-slate-400' },
    { label: 'EXPANSION', value: (state.stats.expansionPressure * 100).toFixed(2) + '%', icon: <Activity size={14} />, color: 'text-red-400' },
  ];

  const getProgress = () => {
    const stages = Object.values(LifeStage);
    const index = stages.indexOf(state.stats.highestLifeStage);
    return (index / (stages.length - 1)) * 100;
  };

  const bioAge = state.civilizationStats.biogenesisTimestamp > 0 
    ? state.realAge - state.civilizationStats.biogenesisTimestamp 
    : 0;

  return (
    <div className="space-y-6">
      {/* General Diagnostics */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
          <Activity size={14} className="text-blue-500" /> COSMIC DIAGNOSTICS
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-800/20 rounded border border-slate-700/30 group hover:bg-slate-800/40 transition-all">
              <div className="flex items-center space-x-2 text-slate-400">
                <span className={s.color || 'group-hover:text-blue-300'}>{s.icon}</span>
                <span className="text-[9px] tracking-widest uppercase font-medium">{s.label}</span>
              </div>
              <span className={`text-xs font-mono font-bold ${s.color || 'text-blue-400'}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Xeno-Evolution Report */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
           <Beaker size={14} className="text-emerald-500" /> XENO-EVOLUTION REPORT
        </h3>

        {/* Timeline Stats */}
        <div className="grid grid-cols-2 gap-2">
           <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Biological Era</span>
              <span className="text-xs text-emerald-300 font-mono">
                  {bioAge > 0 ? formatAge(bioAge) : "PRE-LIFE"}
              </span>
           </div>
           <div className="p-2 bg-slate-900/50 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Complexity Index</span>
              <span className="text-xs text-emerald-300 font-mono">
                  {((state.civilizationStats.discoveredAcids.length + state.civilizationStats.discoveredCompounds.length + state.civilizationStats.discoveredMaterials.length) * 1.5).toFixed(1)}
              </span>
           </div>
        </div>

        {/* Unlocked Lists */}
        {bioAge > 0 ? (
          <div className="space-y-3">
              {/* Acids */}
              <div className="bg-slate-900/30 rounded p-2 border border-slate-800/50">
                <div className="flex items-center gap-2 mb-1 text-[9px] text-slate-400 font-bold uppercase">
                  <Beaker size={10} /> Discovered Acids
                </div>
                <div className="flex flex-wrap gap-1">
                  {state.civilizationStats.discoveredAcids.length > 0 ? (
                    state.civilizationStats.discoveredAcids.map(a => (
                      <span key={a} className="text-[9px] px-1.5 py-0.5 bg-emerald-900/30 text-emerald-400 rounded border border-emerald-900/50">{a}</span>
                    ))
                  ) : <span className="text-[9px] text-slate-600 italic">None detected...</span>}
                </div>
              </div>

              {/* Compounds */}
              <div className="bg-slate-900/30 rounded p-2 border border-slate-800/50">
                <div className="flex items-center gap-2 mb-1 text-[9px] text-slate-400 font-bold uppercase">
                  <Layers size={10} /> Organic Compounds
                </div>
                <div className="flex flex-wrap gap-1">
                  {state.civilizationStats.discoveredCompounds.length > 0 ? (
                    state.civilizationStats.discoveredCompounds.map(c => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded border border-blue-900/50">{c}</span>
                    ))
                  ) : <span className="text-[9px] text-slate-600 italic">Insufficient complexity...</span>}
                </div>
              </div>

               {/* Materials */}
               <div className="bg-slate-900/30 rounded p-2 border border-slate-800/50">
                <div className="flex items-center gap-2 mb-1 text-[9px] text-slate-400 font-bold uppercase">
                  <Pickaxe size={10} /> Advanced Materials
                </div>
                <div className="flex flex-wrap gap-1">
                  {state.civilizationStats.discoveredMaterials.length > 0 ? (
                    state.civilizationStats.discoveredMaterials.map(m => (
                      <span key={m} className="text-[9px] px-1.5 py-0.5 bg-amber-900/30 text-amber-400 rounded border border-amber-900/50">{m}</span>
                    ))
                  ) : <span className="text-[9px] text-slate-600 italic">Pre-industrial...</span>}
                </div>
              </div>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-slate-800 rounded text-center">
            <span className="text-[10px] text-slate-600 italic">Awaiting Abiogenesis...</span>
          </div>
        )}

        {/* Civ Progress */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
               <Cpu size={10} /> CIVILIZATION TYPE I
            </span>
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">
              {state.civilizationStats.civilizationProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
             <div 
               className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-in-out" 
               style={{ width: `${state.civilizationStats.civilizationProgress}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  );
};
