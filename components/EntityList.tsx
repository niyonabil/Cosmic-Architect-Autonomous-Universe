
import React, { useState, useMemo } from 'react';
import { Entity, EntityType } from '../types';
import { Search, Globe, Star, Orbit, Dna, Crosshair, CircleDot, Cloud, Moon, Zap, Wind, Droplets, Mountain, Leaf, Waves, Trees } from 'lucide-react';

interface Props {
  entities: Entity[];
  onSelect: (entity: Entity) => void;
  trackedId?: string;
}

type FilterType = 'ALL' | 'LIFE' | 'GALAXY' | 'STAR' | 'PLANET' | 'MOON' | 'NEBULA' | 'BLACK_HOLE' | 'ASTEROID';

export const EntityList: React.FC<Props> = ({ entities, onSelect, trackedId }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return entities.filter(e => {
      const matchesSearch = (e.name || e.id).toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'ALL') return true;
      if (filter === 'LIFE') return !!e.bio;
      return e.type === filter.toLowerCase(); // EntityType enum matches lowercase strings
    }).sort((a, b) => {
        // Sort Priority: Life > Named > Mass
        if (a.bio && !b.bio) return -1;
        if (!a.bio && b.bio) return 1;
        if (a.name && !b.name) return -1;
        if (!a.name && b.name) return 1;
        return (b.mass || 0) - (a.mass || 0);
    });
  }, [entities, filter, search]);

  const getIcon = (e: Entity) => {
    if (e.bio) return <Leaf size={14} className="text-green-400" />;
    if (e.type === EntityType.GALAXY) return <Orbit size={14} className="text-purple-400" />;
    if (e.type === EntityType.STAR) return <Star size={14} className="text-yellow-400" />;
    if (e.type === EntityType.PLANET) return <Globe size={14} className="text-emerald-400" />;
    if (e.type === EntityType.MOON) return <Moon size={14} className="text-slate-400" />;
    if (e.type === EntityType.BLACK_HOLE) return <CircleDot size={14} className="text-orange-500" />;
    if (e.type === EntityType.NEBULA) return <Cloud size={14} className="text-pink-400" />;
    if (e.type === EntityType.ASTEROID) return <Zap size={14} className="text-slate-600" />;
    return <div className="w-2 h-2 rounded-full bg-slate-500" />;
  };

  const tabs: { id: FilterType; icon: React.ReactNode; label: string }[] = [
    { id: 'ALL', icon: <span className="text-[9px] font-bold">ALL</span>, label: 'All' },
    { id: 'LIFE', icon: <Leaf size={14} className="text-green-400"/>, label: 'Life' },
    { id: 'GALAXY', icon: <Orbit size={14} className="text-purple-400"/>, label: 'Galaxies' },
    { id: 'STAR', icon: <Star size={14} className="text-yellow-400"/>, label: 'Stars' },
    { id: 'PLANET', icon: <Globe size={14} className="text-emerald-400"/>, label: 'Planets' },
    { id: 'MOON', icon: <Moon size={14} className="text-slate-400"/>, label: 'Moons' },
    { id: 'BLACK_HOLE', icon: <CircleDot size={14} className="text-orange-500"/>, label: 'Black Holes' },
    { id: 'NEBULA', icon: <Cloud size={14} className="text-pink-400"/>, label: 'Nebulae' },
    { id: 'ASTEROID', icon: <Zap size={14} className="text-slate-500"/>, label: 'Debris' },
  ];

  // Separate rendering for Bio-Table
  const isBioTable = filter === 'LIFE';

  return (
    <div className="flex flex-col h-full bg-slate-900/30 rounded-lg border border-slate-800 overflow-hidden">
      {/* Scrollable Filter Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 overflow-x-auto scrollbar-hide shrink-0">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`min-w-[50px] p-2 flex flex-col items-center justify-center hover:bg-slate-800 transition-colors ${filter === tab.id ? 'bg-slate-800 border-b-2 border-blue-500' : 'opacity-60 hover:opacity-100'}`}
                title={tab.label}
            >
                {tab.icon}
            </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50 shrink-0">
        <Search size={12} className="text-slate-500" />
        <input 
            className="bg-transparent border-none outline-none text-[10px] text-slate-300 w-full placeholder:text-slate-600 focus:placeholder-slate-500"
            placeholder="Search Database..."
            value={search}
            onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Bio-Table Header */}
      {isBioTable && (
        <div className="flex items-center px-3 py-1 bg-green-950/30 border-b border-green-900/50 text-[9px] text-green-400 font-mono tracking-widest uppercase">
            <span className="flex-1">Species / Planet</span>
            <span className="w-16 text-right">Atmosphere</span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative">
        {filtered.length > 0 ? (
          filtered.map(e => (
              <button
                  key={e.id}
                  onClick={() => onSelect(e)}
                  className={`w-full flex items-center justify-between p-3 hover:bg-slate-800/80 transition-all border-b border-slate-800/50 text-left group 
                    ${trackedId === e.id ? 'bg-blue-900/20 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}
                    ${isBioTable ? 'bg-green-950/10 hover:bg-green-900/20' : ''}
                  `}
              >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <div className={`p-1.5 rounded-md shrink-0 ${trackedId === e.id ? 'bg-blue-500/20' : 'bg-slate-800 group-hover:bg-slate-700'} transition-colors`}>
                        {getIcon(e)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                          <span className={`text-[11px] font-bold uppercase leading-none mb-0.5 truncate ${trackedId === e.id ? 'text-blue-300' : (isBioTable ? 'text-green-300' : 'text-slate-300')} group-hover:text-white`}>
                              {e.name || e.id}
                          </span>
                          
                          {/* Standard View Subtext */}
                          {!isBioTable && (
                            <div className="text-[9px] text-slate-500 flex items-center gap-2 uppercase tracking-tight truncate">
                                <span>{e.type.replace('_', ' ')}</span>
                                {e.bio && (
                                    <span className="text-green-400 font-bold bg-green-900/20 px-1 rounded flex items-center gap-1">
                                    <Dna size={8} /> {e.bio.stage.split('_').pop()}
                                    </span>
                                )}
                            </div>
                          )}

                          {/* Bio View Subtext (Features) */}
                          {isBioTable && (
                             <div className="flex items-center gap-1.5 mt-1">
                                {e.planetaryProfile?.hasWater && (
                                    <span title="Water"><Waves size={8} className="text-blue-400" /></span>
                                )}
                                {e.planetaryProfile?.atmosphereDensity && e.planetaryProfile.atmosphereDensity > 0.1 && (
                                    <span title="Atmosphere"><Wind size={8} className="text-slate-300" /></span>
                                )}
                                {(e.planetaryProfile?.type === 'ROCKY' || e.planetaryProfile?.type === 'EARTH_LIKE') && (
                                    <span title="Terrain"><Trees size={8} className="text-emerald-500" /></span>
                                )}
                                <span className="text-[8px] text-green-500/70 uppercase ml-1 border-l border-green-800 pl-1">
                                    {e.bio?.stage.replace(/_/g, ' ').substring(0, 15)}
                                </span>
                             </div>
                          )}
                      </div>
                  </div>

                  {/* Right side stats for Bio Table */}
                  {isBioTable && e.planetaryProfile && (
                     <div className="flex flex-col items-end pl-2">
                        <span className="text-[9px] font-mono text-slate-400">
                             {(e.planetaryProfile.atmosphereDensity * 100).toFixed(0)}% ATM
                        </span>
                     </div>
                  )}

                  {trackedId === e.id && !isBioTable && <Crosshair size={14} className="text-blue-400 animate-spin-slow opacity-80 shrink-0" />}
              </button>
          ))
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-2 pointer-events-none">
            <Search size={24} className="opacity-20" />
            <span className="text-[10px] italic">No entities found</span>
          </div>
        )}
      </div>
      
      {/* Footer count */}
      <div className="p-1.5 bg-slate-950 text-[9px] text-center text-slate-600 border-t border-slate-800 font-mono shrink-0">
        {filtered.length} {isBioTable ? 'HABITABLE WORLDS' : 'LOCAL OBJECTS'}
      </div>
    </div>
  );
};
