
import React, { useRef, useEffect, useState } from 'react';
import { SimulationState, EntityType, LifeStage, CosmicEpoch, Entity, StellarEvolutionStage, GalaxyType, STAGE_ORDER } from '../types';

interface Props {
  state: SimulationState;
  zoomLevel: number;
  onZoomChange?: (newZoom: number) => void;
  onSetCenter?: (x: number, y: number) => void;
}

// REAL ASSETS REGISTRY (Wikimedia/NASA sources)
const ASSETS = {
    GALAXY_SPIRAL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Messier_101_Sterling_Antioch.jpg/600px-Messier_101_Sterling_Antioch.jpg',
    GALAXY_ELLIPTICAL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Elliptical_galaxy_M87%2C_HST_image.jpg/600px-Elliptical_galaxy_M87%2C_HST_image.jpg',
    STAR_SUN: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/600px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
    EARTH: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/600px-The_Earth_seen_from_Apollo_17.jpg',
    MOON: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/600px-FullMoon2010.jpg',
    MARS: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/600px-OSIRIS_Mars_true_color.jpg',
    JUPITER: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/600px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
    NEBULA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg/600px-Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg',
    DNA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/DNA_Overview.png/600px-DNA_Overview.png',
    CELLS: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/HeLa_cells_stained_with_Hoechst_33258.jpg/600px-HeLa_cells_stained_with_Hoechst_33258.jpg',
    TREE: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg/600px-Ash_Tree_-_geograph.org.uk_-_590710.jpg'
};

const murmurHash = (str: string) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h >>> 0) / 4294967296;
  };
};

export const CosmosVisualizer: React.FC<Props> = ({ state, zoomLevel, onZoomChange, onSetCenter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [internalZoom, setInternalZoom] = useState(zoomLevel);
  const images = useRef<Record<string, HTMLImageElement>>({});
  // Track individual image load status to allow partial rendering
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Load Images Non-Blocking
  useEffect(() => {
    Object.entries(ASSETS).forEach(([key, url]) => {
        if (images.current[key]) return; // Already loading/loaded

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        
        const markLoaded = () => {
            setLoadedImages(prev => ({ ...prev, [key]: true }));
        };

        img.onload = markLoaded;
        img.onerror = () => {
            console.warn(`Failed to load asset: ${key}`);
            setLoadedImages(prev => ({ ...prev, [key]: false })); 
        };
        
        images.current[key] = img;
    });
  }, []);

  const getCamera = () => {
    if (state.trackedEntityId) {
      const tracked = state.entities.find(e => e.id === state.trackedEntityId);
      if (tracked) return { x: tracked.x, y: tracked.y };
    }
    return state.viewOffset || { x: 0, y: 0 };
  };

  const camera = getCamera();

  useEffect(() => {
    if (state.zoomOverride !== undefined) {
      setInternalZoom(state.zoomOverride);
      if (onZoomChange) onZoomChange(state.zoomOverride);
    } else {
      setInternalZoom(zoomLevel);
    }
  }, [zoomLevel, state.zoomOverride, onZoomChange]);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(internalZoom * delta, 0.001), 10000);
    setInternalZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const dx = clickX - cx;
    const dy = clickY - cy;

    const baseScale = 300 * internalZoom;
    
    const worldDx = dx / baseScale;
    const worldDy = dy / baseScale;

    const newX = camera.x + worldDx;
    const newY = camera.y + worldDy;

    if (onSetCenter) onSetCenter(newX, newY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      
      const baseScale = 300 * internalZoom;
      const offsetX = -camera.x * baseScale;
      const offsetY = -camera.y * baseScale;
      
      ctx.translate(offsetX, offsetY);

      // --- OBSERVABLE UNIVERSE SPHERE (Cosmic Horizon) ---
      // Real scientific visualization: The universe is spherical from the observer's perspective
      if (internalZoom < 0.2) {
         const universeRadius = 15000; // Simulated scale of observable universe
         
         // 1. Cosmic Microwave Background (CMB) at the edge
         const grad = ctx.createRadialGradient(0, 0, universeRadius * 0.9, 0, 0, universeRadius);
         grad.addColorStop(0, '#000000');
         grad.addColorStop(0.5, '#1a1040'); // Early ionized plasma
         grad.addColorStop(0.8, '#4c1d1d'); // Redshifted recombination
         grad.addColorStop(1, '#000000'); // Beyond Horizon
         
         ctx.fillStyle = grad;
         ctx.beginPath(); 
         ctx.arc(0, 0, universeRadius, 0, Math.PI * 2); 
         ctx.fill();

         // 2. Cosmic Web (Filament Structure)
         // Procedural generation of large scale structure
         if (internalZoom < 0.05) {
             ctx.strokeStyle = 'rgba(70, 80, 150, 0.15)';
             ctx.lineWidth = 2 / internalZoom;
             ctx.beginPath();
             const seed = 12345;
             const filaments = 100;
             for (let i = 0; i < filaments; i++) {
                 // Simple noise-like lines connecting random points within sphere
                 const a1 = (i * 137.5) * Math.PI / 180;
                 const r1 = (Math.sin(i) * 0.5 + 0.5) * universeRadius * 0.8;
                 const x1 = Math.cos(a1) * r1;
                 const y1 = Math.sin(a1) * r1;
                 
                 const a2 = (i * 200) * Math.PI / 180;
                 const r2 = (Math.cos(i) * 0.5 + 0.5) * universeRadius * 0.8;
                 const x2 = Math.cos(a2) * r2;
                 const y2 = Math.sin(a2) * r2;

                 ctx.moveTo(x1, y1);
                 ctx.bezierCurveTo(x1 + 500, y1 + 500, x2 - 500, y2 - 500, x2, y2);
             }
             ctx.stroke();
         }
      } else {
         // Deep Space Background (Local)
         ctx.fillStyle = '#000000';
         ctx.fillRect(-width*10/baseScale - camera.x, -height*10/baseScale - camera.y, width*20/baseScale, height*20/baseScale);
      }


      // --- BIG BANG / BACKGROUND RADIATION ---
      if (state.explosionProgress > 0) {
        const blastRadius = state.explosionProgress * Math.max(width, height) * 0.8;
        
        // Gradient Blast
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, blastRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 220, 150, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 100, 50, 0.5)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(0, 0, blastRadius, 0, Math.PI * 2); ctx.fill();

        // Particle Debris (Noise)
        if (state.explosionProgress > 0.1) {
             const rand = murmurHash(state.age.toString());
             ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
             const count = 50 + Math.floor(state.explosionProgress * 100);
             for(let i=0; i<count; i++) {
                 const r = rand() * blastRadius;
                 const a = rand() * Math.PI * 2;
                 const px = Math.cos(a) * r;
                 const py = Math.sin(a) * r;
                 ctx.beginPath(); ctx.arc(px, py, rand() * 2, 0, Math.PI*2); ctx.fill();
             }
        }
      }

      state.entities.forEach(ent => {
        const x = ent.x * baseScale;
        const y = ent.y * baseScale;
        
        // Culling
        if (x + offsetX < -width / 2 - 400 || x + offsetX > width / 2 + 400 ||
            y + offsetY < -height / 2 - 400 || y + offsetY > height / 2 + 400) return;

        // --- GALAXY RENDERING ---
        if (ent.type === EntityType.GALAXY) {
           const size = Math.max(20, (ent.mass / 2000) * internalZoom);
           
           ctx.save();
           ctx.translate(x, y);
           ctx.globalCompositeOperation = 'screen';
           
           const imgKey = ent.galaxyData?.type === GalaxyType.SPIRAL ? 'GALAXY_SPIRAL' : 'GALAXY_ELLIPTICAL';
           const img = images.current[imgKey];
           const isLoaded = loadedImages[imgKey] && img && img.complete && img.naturalWidth > 0;

           if (isLoaded) {
             ctx.globalAlpha = Math.min(1, internalZoom * 2); 
             if (ent.galaxyData?.type === GalaxyType.SPIRAL) {
                 ctx.rotate(state.age * 0.0005 + parseFloat(ent.id.split('-')[1] || '0'));
             }
             ctx.drawImage(img, -size/2, -size/2, size, size);
           } else {
             const grad = ctx.createRadialGradient(0,0,0,0,0,size/2);
             grad.addColorStop(0, 'white');
             grad.addColorStop(0.5, ent.color || '#a5b4fc');
             grad.addColorStop(1, 'transparent');
             ctx.fillStyle = grad;
             ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.fill();
             
             if (ent.galaxyData?.type === GalaxyType.SPIRAL && internalZoom > 0.5) {
                 ctx.rotate(state.age * 0.001);
                 ctx.strokeStyle = ent.color || '#a5b4fc';
                 ctx.lineWidth = size/10;
                 ctx.beginPath();
                 ctx.moveTo(0,0); ctx.lineTo(size/2, 0);
                 ctx.moveTo(0,0); ctx.lineTo(-size/2, 0);
                 ctx.stroke();
             }
           }
           ctx.restore();
        } 
        
        // --- NEBULA RENDERING ---
        else if (ent.type === EntityType.NEBULA) {
           const size = Math.max(10, (ent.mass / 100) * internalZoom);
           ctx.save();
           ctx.translate(x, y);
           ctx.globalCompositeOperation = 'screen';
           
           const imgKey = 'NEBULA';
           const img = images.current[imgKey];
           const isLoaded = loadedImages[imgKey] && img && img.complete;

           if (isLoaded) {
               ctx.globalAlpha = 0.6;
               ctx.drawImage(img, -size/2, -size/2, size, size);
           } else {
               const grad = ctx.createRadialGradient(0,0,0,0,0,size/2);
               grad.addColorStop(0, `${ent.color}88`);
               grad.addColorStop(1, 'transparent');
               ctx.fillStyle = grad;
               ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.fill();
           }
           ctx.restore();
        }

        // --- STAR RENDERING ---
        else if (ent.type === EntityType.STAR) {
          if (internalZoom < 0.5 && ent.parentId) return;

          let sSize = Math.max(4, (ent.mass / 200) * internalZoom);
          
          ctx.save();
          ctx.translate(x, y);
          
          const imgKey = 'STAR_SUN';
          const img = images.current[imgKey];
          const isLoaded = loadedImages[imgKey] && img && img.complete;

          if (isLoaded) {
              // Star Glow (Scientific Blackbody Color)
              const glowSize = sSize * 6;
              const glow = ctx.createRadialGradient(0,0,sSize,0,0,glowSize);
              glow.addColorStop(0, ent.color + '88'); // Use precise spectral color
              glow.addColorStop(1, 'transparent');
              ctx.fillStyle = glow;
              ctx.globalCompositeOperation = 'screen';
              ctx.beginPath(); ctx.arc(0,0,glowSize,0,Math.PI*2); ctx.fill();

              ctx.globalCompositeOperation = 'screen';
              ctx.beginPath(); ctx.arc(0,0,sSize,0,Math.PI*2); ctx.clip();
              // Tint the sun image with accurate color
              ctx.drawImage(img, -sSize, -sSize, sSize*2, sSize*2);
              
              ctx.globalCompositeOperation = 'overlay';
              ctx.fillStyle = ent.color;
              ctx.fillRect(-sSize, -sSize, sSize*2, sSize*2);
          } else {
              const glow = ctx.createRadialGradient(0,0,sSize*0.5,0,0,sSize*3);
              glow.addColorStop(0, ent.color);
              glow.addColorStop(1, 'transparent');
              ctx.fillStyle = glow;
              ctx.beginPath(); ctx.arc(0,0,sSize*3,0,Math.PI*2); ctx.fill();
              
              ctx.fillStyle = '#fff';
              ctx.beginPath(); ctx.arc(0,0,sSize*0.8,0,Math.PI*2); ctx.fill();
          }
          ctx.restore();
        }

        // --- PLANET RENDERING ---
        else if (ent.type === EntityType.PLANET || ent.type === EntityType.MOON) {
          const planetFadeStart = 8.0;
          let planetAlpha = 0;
          if (internalZoom > planetFadeStart) planetAlpha = Math.min(1, (internalZoom - planetFadeStart) / 10);

          if (planetAlpha > 0) {
              const pSize = Math.max(3, (ent.isEarth ? 5 : 3.5) * internalZoom);
              
              // Draw Orbit Line
              if (ent.parentId && internalZoom > 15) {
                 const parent = state.entities.find(e => e.id === ent.parentId);
                 if (parent) {
                    // Elliptical orbit approximation for visual
                    const pdx = x - (parent.x * baseScale);
                    const pdy = y - (parent.y * baseScale);
                    const radius = Math.sqrt(pdx*pdx + pdy*pdy);
                    ctx.save();
                    ctx.beginPath(); ctx.arc(parent.x * baseScale, parent.y * baseScale, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; // Faint Orbit Trail
                    ctx.lineWidth = 1; 
                    ctx.stroke(); ctx.restore();
                 }
              }

              ctx.save();
              ctx.globalAlpha = planetAlpha;
              ctx.translate(x, y);

              // 1. Select Texture
              let imgKey = 'MARS';
              if (ent.isEarth) imgKey = 'EARTH';
              else if (ent.type === EntityType.MOON) imgKey = 'MOON';
              else if (ent.planetaryProfile?.type === 'GAS_GIANT') imgKey = 'JUPITER';
              else if (ent.planetaryProfile?.hasWater) imgKey = 'EARTH';
              
              const img = images.current[imgKey];
              const isLoaded = loadedImages[imgKey] && img && img.complete;

              if (isLoaded) {
                  // Planet body
                  ctx.beginPath(); ctx.arc(0,0,pSize,0,Math.PI*2); ctx.clip();
                  const rot = state.age * 0.005;
                  ctx.rotate(rot);
                  ctx.drawImage(img, -pSize, -pSize, pSize*2, pSize*2);
                  ctx.rotate(-rot);

                  // 2. Atmosphere Glow
                  if (ent.planetaryProfile?.atmosphereDensity && ent.planetaryProfile.atmosphereDensity > 0.1) {
                      ctx.globalCompositeOperation = 'screen';
                      const atmColor = ent.isEarth ? '#4da6ff' : '#ffffff';
                      const grad = ctx.createRadialGradient(0,0,pSize*0.8, 0,0, pSize*1.2);
                      grad.addColorStop(0, 'transparent');
                      grad.addColorStop(0.8, atmColor + '66');
                      grad.addColorStop(1, 'transparent');
                      ctx.fillStyle = grad;
                      ctx.beginPath(); ctx.arc(0,0,pSize*1.5,0,Math.PI*2); ctx.fill();
                      ctx.globalCompositeOperation = 'source-over';
                  }

                  // 3. Shadow (Day/Night Cycle) & Civilization Lights
                  // The shadow covers the "night" side. Cities should be visible IN the shadow.
                  const shadow = ctx.createRadialGradient(0,0,pSize*0.5, 0,0, pSize);
                  shadow.addColorStop(0, 'transparent');
                  shadow.addColorStop(0.9, 'rgba(0,0,0,0.85)');
                  shadow.addColorStop(1, 'rgba(0,0,0,0.95)');
                  
                  // Render City Lights if civilization is advanced (Sapient +)
                  const hasCiv = ent.bio && STAGE_ORDER.indexOf(ent.bio.stage) >= STAGE_ORDER.indexOf(LifeStage.SAPIENT_COGNITION);
                  
                  if (hasCiv && internalZoom > 20) {
                      ctx.save();
                      const rand = murmurHash(ent.id);
                      ctx.fillStyle = '#fbbf24'; // Warm light
                      ctx.globalCompositeOperation = 'screen';
                      ctx.globalAlpha = 0.8;
                      const lightCount = 40; 
                      for(let i=0; i<lightCount; i++) {
                         const lx = (rand() - 0.5) * pSize * 1.5;
                         const ly = (rand() - 0.5) * pSize * 1.5;
                         if (lx*lx + ly*ly < pSize*pSize) {
                             ctx.beginPath(); ctx.arc(lx, ly, internalZoom > 80 ? 0.8 : 0.4, 0, Math.PI*2); ctx.fill();
                         }
                      }
                      ctx.restore();
                  }

                  ctx.fillStyle = shadow;
                  ctx.beginPath(); ctx.arc(0,0,pSize,0,Math.PI*2); ctx.fill();

              } else {
                  // Fallback
                  ctx.fillStyle = ent.isEarth ? '#1d4ed8' : ent.color;
                  ctx.beginPath(); ctx.arc(0,0,pSize,0,Math.PI*2); ctx.fill();
                  const shadow = ctx.createRadialGradient(0,0,pSize*0.5, 0,0, pSize);
                  shadow.addColorStop(0, 'transparent');
                  shadow.addColorStop(1, 'rgba(0,0,0,0.5)');
                  ctx.fillStyle = shadow;
                  ctx.beginPath(); ctx.arc(0,0,pSize,0,Math.PI*2); ctx.fill();
              }

              // 4. Vegetation / Trees Overlay
              if (ent.bio && internalZoom > 60 && (ent.isEarth || ent.planetaryProfile?.type === 'EARTH_LIKE')) {
                  const rand = murmurHash(ent.id);
                  const treeImg = images.current['TREE'];
                  const treeLoaded = loadedImages['TREE'] && treeImg && treeImg.complete;
                  
                  if (treeLoaded) {
                      const count = 5;
                      for(let t=0; t<count; t++) {
                          const tx = (rand() - 0.5) * pSize * 1.2;
                          const ty = (rand() - 0.5) * pSize * 1.2;
                          if (tx*tx + ty*ty < pSize*pSize) {
                              ctx.drawImage(treeImg, tx - pSize*0.2, ty - pSize*0.2, pSize*0.4, pSize*0.4);
                          }
                      }
                  } else {
                      ctx.fillStyle = '#166534'; 
                      const count = 5;
                      for(let t=0; t<count; t++) {
                          const tx = (rand() - 0.5) * pSize * 1.2;
                          const ty = (rand() - 0.5) * pSize * 1.2;
                          if (tx*tx + ty*ty < pSize*pSize) {
                             ctx.beginPath(); ctx.arc(tx,ty, pSize*0.1, 0, Math.PI*2); ctx.fill();
                          }
                      }
                  }
              }

              ctx.restore();

              // --- MICROSCOPIC VIEW ---
              if (ent.bio && internalZoom > 150) {
                  const microOpacity = Math.min(1, (internalZoom - 150) / 100);
                  const boxSize = pSize * 6;
                  
                  ctx.save();
                  ctx.translate(x, y);
                  ctx.globalAlpha = microOpacity;
                  
                  // Background: Cells
                  const cellImg = images.current['CELLS'];
                  const cellLoaded = loadedImages['CELLS'] && cellImg && cellImg.complete;
                  
                  if (cellLoaded) {
                      ctx.beginPath();
                      ctx.rect(-boxSize/2, -boxSize/2, boxSize, boxSize);
                      ctx.clip();
                      ctx.drawImage(cellImg, -boxSize/2, -boxSize/2, boxSize, boxSize);
                      ctx.fillStyle = 'rgba(0,0,0,0.4)';
                      ctx.fillRect(-boxSize/2, -boxSize/2, boxSize, boxSize);
                  } else {
                      ctx.fillStyle = '#064e3b';
                      ctx.fillRect(-boxSize/2, -boxSize/2, boxSize, boxSize);
                  }

                  // Foreground: DNA Strands
                  const dnaImg = images.current['DNA'];
                  const dnaLoaded = loadedImages['DNA'] && dnaImg && dnaImg.complete;

                  if (dnaLoaded) {
                      const dnaSize = boxSize * 0.8;
                      const time = state.age * 0.02;
                      ctx.translate(Math.sin(time)*10, 0); 
                      ctx.drawImage(dnaImg, -dnaSize/2, -dnaSize/2, dnaSize, dnaSize);
                  } else {
                      ctx.strokeStyle = '#4ade80';
                      ctx.lineWidth = 4;
                      ctx.beginPath();
                      ctx.moveTo(-boxSize/2, 0); ctx.lineTo(boxSize/2, 0);
                      ctx.stroke();
                  }

                  ctx.fillStyle = '#fff';
                  ctx.font = '12px sans-serif';
                  ctx.shadowColor = 'black';
                  ctx.shadowBlur = 4;
                  ctx.fillText("MICROSCOPIC ANALYSIS", -60, -boxSize/2 - 10);

                  ctx.restore();
              }
          }
        }
      });

      // --- VISUAL PING / SELECTION RETICLE ---
      if (state.trackedEntityId) {
        ctx.strokeStyle = '#3b82f6'; // Blue-500
        ctx.lineWidth = 2;
        
        // Rotating Reticle
        const size = 35;
        const time = Date.now() / 500;
        
        ctx.save();
        ctx.rotate(time);
        
        // Corner brackets
        const corner = 10;
        ctx.beginPath();
        // Top Left
        ctx.moveTo(-size, -size + corner); ctx.lineTo(-size, -size); ctx.lineTo(-size + corner, -size);
        // Top Right
        ctx.moveTo(size - corner, -size); ctx.lineTo(size, -size); ctx.lineTo(size, -size + corner);
        // Bottom Right
        ctx.moveTo(size, size - corner); ctx.lineTo(size, size); ctx.lineTo(size - corner, size);
        // Bottom Left
        ctx.moveTo(-size + corner, size); ctx.lineTo(-size, size); ctx.lineTo(-size, size - corner);
        ctx.stroke();
        
        ctx.restore();

        // Pulsing Circle Inner
        const pulse = Math.abs(Math.sin(time * 2)) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(59, 130, 246, ${pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Label Text
        ctx.fillStyle = '#3b82f6';
        ctx.font = '10px monospace';
        ctx.fillText("TARGET LOCKED", -35, -size - 10);
      }

      ctx.restore();
    };

    render();
  }, [state, internalZoom, camera, loadedImages]);

  const isLoadingEssentials = !loadedImages['GALAXY_SPIRAL'] || !loadedImages['STAR_SUN'];

  return (
    <div className="relative w-full h-full">
        {isLoadingEssentials && (
            <div className="absolute top-4 left-4 z-50 text-blue-400 font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded border border-blue-500/20 animate-pulse">
                DOWNLOADING TEXTURES...
            </div>
        )}
        <canvas 
        ref={canvasRef} 
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className="w-full h-full bg-black outline-none block"
        />
    </div>
  );
};
