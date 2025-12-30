
import { 
  SimulationState, 
  Entity, 
  EntityType, 
  PhysicalConstants, 
  LogEntry, 
  LifeStage, 
  PlanetaryType, 
  compareStages, 
  STAGE_ORDER,
  OrderTarget,
  OrderAction, 
  OrderScope,
  CosmicEpoch,
  SimulationNotification,
  AtmosphericComposition,
  StellarEvolutionStage,
  CivilizationStats,
  GalaxyType,
  ChatMessage
} from '../types';

const TICK_TO_YEARS = 10_000_000;
const LIGHT_SPEED_C = 1.0; // Simulation units
const SCHWARZSCHILD_CONST = 2.0; // 2GM/c^2 simplified

const INITIAL_CONSTANTS: PhysicalConstants = {
  G: 0.95,         
  H: 0.012,        
  Lambda: 0.003,   
  DM: 4.8,         
  c: LIGHT_SPEED_C,
  ent: 0.00012,
  mut: 0.035,
  OmegaM: 0.35,
  OmegaL: 0.65,
  StarFormationThreshold: 200, 
  PlanetFormationThreshold: 40,
};

// SCIENTIFICALLY ACCURATE SPECTRAL COLORS (approximate sRGB)
const SPECTRAL_COLORS: Record<string, string> = {
  'O': '#9bb0ff', // > 30,000K (Blue)
  'B': '#aabfff', // 10,000-30,000K (Blue-white)
  'A': '#cad7ff', // 7,500-10,000K (White-blue)
  'F': '#f8f7ff', // 6,000-7,500K (White)
  'G': '#fff4ea', // 5,200-6,000K (Yellow-white - Sun)
  'K': '#ffd2a1', // 3,700-5,200K (Orange)
  'M': '#ffcc6f', // 2,400-3,700K (Red)
  'WD': '#a0c4ff', // White Dwarf (Hot bluish white)
  'NS': '#00ffff'  // Neutron Star (X-ray/visual approximation)
};

// Data tables for evolution unlocks
const ACIDS = ["Glycine", "Alanine", "Valine", "Leucine", "Serine", "Cysteine", "Proline", "Tyrosine", "Histidine", "Tryptophan"];
const COMPOUNDS = ["Phospholipids", "Ribose", "Adenosine", "Enzymes", "Chlorophyll", "Hemoglobin", "Myosin", "Neurotransmitters", "Hormones"];
const MATERIALS = ["Stone Tools", "Copper", "Bronze", "Iron", "Steel", "Silicon", "Plastics", "Graphene", "Carbon Nanotubes", "Antimatter"];

export class UniverseEngine {
  private state: SimulationState;
  private logs: LogEntry[] = [];
  private hasEarthBorn = false;
  private hasSolarSystemBorn = false;
  private hasLifeBornInUniverse = false;
  private hasLifeBornOnEarth = false;
  private highestAchievedStage: LifeStage = LifeStage.NONE;
  
  // LIFE ORIGIN RULE: No life before 117 Ga
  private readonly LIFE_ORIGIN_THRESHOLD_YEARS = 117_000_000_000;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): SimulationState {
    return {
      age: 0,
      realAge: 0,
      explosionProgress: 0,
      cosmicTemperature: 10e30,
      entities: [],
      constants: { ...INITIAL_CONSTANTS },
      entropy: 0,
      isBigBangOccurred: false,
      cosmicEpoch: CosmicEpoch.SINGULARITY,
      notifications: [],
      viewOffset: { x: 0, y: 0 },
      zoomOverride: undefined,
      stats: {
        totalGalaxies: 0,
        totalStars: 0,
        totalPlanets: 0,
        totalMoons: 0,
        totalAsteroids: 0,
        totalNebulae: 0,
        totalBlackHoles: 0,
        highestLifeStage: LifeStage.NONE,
        expansionPressure: 0,
        activeCivilizations: 0,
        totalBiospheres: 0
      },
      civilizationStats: {
        biogenesisTimestamp: 0,
        discoveredAcids: [],
        discoveredCompounds: [],
        discoveredMaterials: [],
        civilizationProgress: 0
      },
      isContactEstablished: false,
      chatHistory: []
    };
  }

  public bigBang() {
    this.state = this.getInitialState();
    this.state.isBigBangOccurred = true;
    this.state.explosionProgress = 1.0;
    this.addLog("SINGULARITY: T=0. Spacetime Metric Initialized.", 'critical');
    this.hasEarthBorn = false;
    this.hasSolarSystemBorn = false;
    this.hasLifeBornInUniverse = false;
    this.hasLifeBornOnEarth = false;
    this.highestAchievedStage = LifeStage.NONE;
  }

  public tick() {
    if (!this.state.isBigBangOccurred) return;

    this.state.age += 1;
    this.state.realAge = this.state.age * TICK_TO_YEARS;
    
    if (this.state.explosionProgress > 0) {
      this.state.explosionProgress -= 0.03;
      if (this.state.explosionProgress < 0) this.state.explosionProgress = 0;
    }

    this.updateEpoch();
    this.handleCosmology();
    this.applyPhysics(this.state.constants.H);
    this.handleLifeCycle();
    this.handleStellarEvolution();
    this.handleHabitabilityDynamics();
    this.handleCivilizationActivity(); 
    this.updateStats(this.state.constants.H);
  }

  private updateEpoch() {
    const age = this.state.realAge;
    if (age < 380_000) this.state.cosmicEpoch = CosmicEpoch.INFLATION;
    else if (age < 100_000_000) this.state.cosmicEpoch = CosmicEpoch.RECOMBINATION;
    else if (age < 200_000_000) this.state.cosmicEpoch = CosmicEpoch.DARK_AGES;
    else if (age < 9_000_000_000) this.state.cosmicEpoch = CosmicEpoch.STELLARIFEROUS;
    else this.state.cosmicEpoch = CosmicEpoch.LIFE_BEARING;
  }

  private handleCosmology() {
    this.state.cosmicTemperature *= 0.985;
    
    // Initial primordial black holes
    if (this.state.cosmicEpoch === CosmicEpoch.DARK_AGES && this.state.age % 100 === 0 && this.state.entities.length < 5) {
      if (Math.random() < 0.1) this.spawnBlackHole();
    }

    if (this.state.cosmicEpoch === CosmicEpoch.DARK_AGES && this.state.entities.length < 20) {
      this.seedInitialMatter();
    }
    
    // Background Universe Simulation
    if (this.state.realAge > 1_000_000_000 && this.state.entities.length < 100 && Math.random() < 0.005) {
       this.spawnGalaxy(); 
    }
    if (this.state.realAge > 1_000_000_000 && this.state.age % 240 === 0) {
      this.spawnRandomAsteroids();
    }
  }

  private seedInitialMatter() {
    // Initial Nebulae that will form the Local Group
    const dustCount = 50; 
    for (let i = 0; i < dustCount; i++) {
      this.spawnNebula();
    }
  }

  private spawnNebula(origin?: { x: number, y: number, vx: number, vy: number }) {
    let x, y, vx, vy;

    if (origin) {
      const offset = 0.5 + Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;
      x = origin.x + Math.cos(angle) * offset;
      y = origin.y + Math.sin(angle) * offset;
      vx = origin.vx * 0.95 + (Math.random() - 0.5) * 0.05;
      vy = origin.vy * 0.95 + (Math.random() - 0.5) * 0.05;
    } else {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.20; 
      x = Math.cos(angle) * r;
      y = Math.sin(angle) * r;
      const v = 0.6 + Math.random() * 0.6;
      vx = -y * v; 
      vy = x * v;
    }
    
    // Star formation stops after 30 Ga (Degenerate Era begins)
    if (this.state.realAge > 30_000_000_000) return;

    this.state.entities.push({
      id: Math.random().toString(36).substr(2, 9),
      type: EntityType.NEBULA,
      x, y, z: 0,
      vx, vy, vz: 0,
      mass: 150 + Math.random() * 300,
      age: 0,
      energy: 5500,
      temperature: 16000,
      color: '#f97316',
      habitability: 0,
      tidalStress: 0,
      impactCounter: 0
    });
  }

  private spawnGalaxy(sourceNebula?: Entity, massOverride?: number, x?: number, y?: number) {
    let px, py, pvx, pvy;
    
    if (sourceNebula) {
        px = sourceNebula.x;
        py = sourceNebula.y;
        pvx = sourceNebula.vx;
        pvy = sourceNebula.vy;
    } else {
        const angle = Math.random() * Math.PI * 2;
        const dist = 8.0 + Math.random() * 12.0; 
        px = x ?? Math.cos(angle) * dist;
        py = y ?? Math.sin(angle) * dist;
        pvx = -px * 0.005; 
        pvy = -py * 0.005;
    }

    const mass = massOverride ?? (sourceNebula ? sourceNebula.mass * 0.8 : 50000); 
    const stars = mass * (1000000 + Math.random() * 2000000);

    let type = GalaxyType.IRREGULAR;
    let color = '#ffffff';
    let armCount = 0;
    let rotSpeed = (Math.random() - 0.5) * 0.004;

    if (mass > 20000) {
        if (Math.abs(rotSpeed) > 0.001) {
            type = GalaxyType.SPIRAL;
            color = '#a5b4fc'; 
            armCount = 2 + Math.floor(Math.random() * 4);
        } else {
            type = GalaxyType.ELLIPTICAL;
            color = '#fde047'; 
            armCount = 0;
        }
    } else {
        type = GalaxyType.IRREGULAR;
        color = '#fbcfe8';
        armCount = 0;
    }

    const galaxy: Entity = {
      id: 'GX-' + Math.random().toString(36).substr(2, 6),
      type: EntityType.GALAXY,
      x: px, y: py, z: 0,
      vx: pvx, vy: pvy, vz: 0,
      mass: mass,
      age: Math.random() * 1000,
      energy: 1e40,
      temperature: 4,
      color: color,
      stellarCount: stars,
      planetCount: stars * (0.5 + Math.random() * 2),
      habitability: 0,
      tidalStress: 0,
      impactCounter: 0,
      galaxyData: {
        type,
        rotationSpeed: rotSpeed,
        armCount
      }
    };

    this.state.entities.push(galaxy);

    const internalStarCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < internalStarCount; i++) {
        const offsetR = 0.5 + Math.random() * 1.5;
        const offsetA = Math.random() * Math.PI * 2;
        const sx = galaxy.x + Math.cos(offsetA) * offsetR;
        const sy = galaxy.y + Math.sin(offsetA) * offsetR;
        
        const star: Entity = {
            id: 'S-' + Math.random().toString(36).substr(2, 7),
            type: EntityType.NEBULA, 
            x: sx, y: sy, z: 0,
            vx: galaxy.vx + (Math.random() - 0.5) * 0.01,
            vy: galaxy.vy + (Math.random() - 0.5) * 0.01,
            vz: 0,
            mass: 250 + Math.random() * 800,
            age: 0,
            energy: 10000,
            temperature: 500,
            color: '#ffffff',
            habitability: 0,
            tidalStress: 0,
            impactCounter: 0,
            parentId: galaxy.id
        };
        this.state.entities.push(star);
    }
  }

  private spawnBlackHole(origin?: Entity) {
    const id = origin ? origin.id : "BH-" + Math.random().toString(36).substr(2, 5);
    const x = origin ? origin.x : (Math.random() - 0.5) * 0.5;
    const y = origin ? origin.y : (Math.random() - 0.5) * 0.5;
    const vx = origin ? origin.vx : 0;
    const vy = origin ? origin.vy : 0;
    const mass = origin ? origin.mass * 0.8 : 5000; 

    const bh: Entity = {
      id,
      type: EntityType.BLACK_HOLE,
      x, y, z: 0,
      vx, vy, vz: 0,
      mass, 
      age: 0, energy: 0, temperature: 0,
      color: '#000000',
      habitability: 0, tidalStress: 0, impactCounter: 0,
      blackHoleStats: { accretionDiskRadius: 2.5, consumedMass: 0 }
    };

    if (origin) {
      const idx = this.state.entities.findIndex(e => e.id === origin.id);
      if (idx !== -1) this.state.entities[idx] = bh;
    } else {
      this.state.entities.push(bh);
    }
  }

  private spawnRandomAsteroids() {
    if (Math.random() < 0.25) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.8 + Math.random() * 4.2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      this.state.entities.push({
        id: 'ast-' + Math.random().toString(36).substr(2, 5),
        type: EntityType.ASTEROID,
        x, y, z: 0,
        vx: -x * 0.025,
        vy: -y * 0.025,
        vz: 0,
        mass: 15 + Math.random() * 25,
        age: 0,
        energy: 1200,
        temperature: 80,
        color: '#64748b',
        habitability: 0,
        tidalStress: 0,
        impactCounter: 0
      });
    }
  }

  private applyPhysics(h: number) {
    const { G, DM, Lambda, c } = this.state.constants;
    const ents = this.state.entities;
    
    for (let i = 0; i < ents.length; i++) {
      const e1 = ents[i];
      let ax = 0, ay = 0;

      // 1. RELATIVITY: Relativistic Mass Increase
      // As v approaches c, mass effectively increases, making it harder to accelerate
      const velocitySq = e1.vx*e1.vx + e1.vy*e1.vy;
      const lorentzFactor = 1 / Math.sqrt(Math.max(0.1, 1 - Math.min(0.99, velocitySq / (c*c))));
      
      // 2. COSMOLOGY: Dark Energy Expansion (Lambda)
      // Only applies significantly to unbound objects at large distances
      if (!e1.parentId) {
         ax += e1.x * Lambda * 0.012;
         ay += e1.y * Lambda * 0.012;
      }

      for (let j = 0; j < ents.length; j++) {
        if (i === j) continue;
        const e2 = ents[j];
        
        // Optimizations: Skip calculation for disparate scales unless connected
        if (e1.type === EntityType.GALAXY && e2.type === EntityType.ASTEROID) continue;
        if (e1.type === EntityType.ASTEROID && e2.type === EntityType.GALAXY) continue;
        if (e1.parentId && e1.parentId === e2.id && e2.type === EntityType.GALAXY) continue; 

        const dx = e2.x - e1.x;
        const dy = e2.y - e1.y;
        const d2 = dx*dx + dy*dy + 0.35; // Softening parameter
        const dist = Math.sqrt(d2);

        // Gravity Range Limit (Gravity is infinite but we clip for performance)
        const range = (e1.type === EntityType.GALAXY || e2.type === EntityType.GALAXY) ? 500.0 : 25.0;

        if (dist < range) {
          let forceMult = 1.0;
          if (e2.type === EntityType.BLACK_HOLE) forceMult = 3.5;
          if (e2.type === EntityType.GALAXY) forceMult = 0.5; 

          // NEWTONIAN + DARK MATTER APPROXIMATION
          const f = (G * e2.mass * DM * 0.08 * forceMult) / d2;
          
          // Apply force modified by relativistic mass (F = ma => a = F/m)
          // Heavier relativistic mass means less acceleration from gravity
          const accel = f / lorentzFactor;

          ax += accel * (dx / dist);
          ay += accel * (dy / dist);
        }
      }
      e1.vx += ax;
      e1.vy += ay;

      // Speed Limit (Universal C)
      const speed = Math.sqrt(e1.vx*e1.vx + e1.vy*e1.vy);
      if (speed > c) {
        e1.vx = (e1.vx / speed) * c;
        e1.vy = (e1.vy / speed) * c;
      }

      // INTEGRATION
      // Orbiting bodies (bound systems) do NOT experience Hubble Flow expansion
      if (e1.parentId) {
         e1.x += e1.vx;
         e1.y += e1.vy;
      } else {
         // Unbound objects drift with expansion
         e1.x = (e1.x + e1.vx) * (1 + h * 0.005);
         e1.y = (e1.y + e1.vy) * (1 + h * 0.005);
      }
      
      // Conservation of Momentum (simulated drag only for gas clouds, not planets)
      if (e1.type === EntityType.NEBULA) {
          e1.vx *= 0.9996;
          e1.vy *= 0.9996;
      }
    }
  }

  private handleLifeCycle() {
    const ents = this.state.entities;
    if (this.state.cosmicEpoch === CosmicEpoch.INFLATION || this.state.cosmicEpoch === CosmicEpoch.RECOMBINATION) return;
    
    // NO STAR FORMATION after 30 Ga
    const canFormStars = this.state.realAge < 30_000_000_000;

    for (let i = ents.length - 1; i >= 0; i--) {
      const ent = ents[i];
      if (!ent) continue;

      if (ent.type === EntityType.NEBULA) {
        if (canFormStars && ent.mass > this.state.constants.StarFormationThreshold) {
          this.igniteStar(ent);
        }
        if (ent.mass > 12000) {
           this.state.entities.splice(i, 1);
           this.spawnGalaxy(ent); 
        }
      }

      for (let j = i - 1; j >= 0; j--) {
        const other = ents[j];
        if (!other) continue;
        
        if (ent.type === EntityType.GALAXY && other.type !== EntityType.GALAXY) continue;
        
        const dx = other.x - ent.x;
        const dy = other.y - ent.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let collisionRadius = (Math.sqrt(ent.mass) + Math.sqrt(other.mass)) * 0.009 + 0.09;
        if (ent.type === EntityType.BLACK_HOLE) collisionRadius *= 1.5;
        if (ent.type === EntityType.GALAXY) collisionRadius = 2.0;

        if (dist < collisionRadius) {
          this.resolveInteraction(ent, other, j);
        }
      }
    }
  }

  private resolveInteraction(a: Entity, b: Entity, bIdx: number) {
    if (a.type === EntityType.GALAXY && b.type === EntityType.GALAXY) {
      const totalMass = a.mass + b.mass;
      a.vx = (a.vx * a.mass + b.vx * b.mass) / totalMass;
      a.vy = (a.vy * a.mass + b.vy * b.mass) / totalMass;
      a.mass = totalMass;
      
      let mergerType = "MINOR";
      const ratio = Math.min(a.mass, b.mass) / Math.max(a.mass, b.mass);
      if (ratio > 0.25) {
          mergerType = "MAJOR";
          if (a.galaxyData) {
            a.galaxyData.type = GalaxyType.ELLIPTICAL;
            a.galaxyData.armCount = 0;
            a.color = '#fde047'; 
            a.galaxyData.rotationSpeed = (a.galaxyData.rotationSpeed + (b.galaxyData?.rotationSpeed || 0)) * 0.5 * Math.random();
          }
      } else {
          a.galaxyData!.rotationSpeed *= 0.95; 
      }

      this.state.entities.splice(bIdx, 1);
      
      const starburst = 3 + Math.floor(Math.random() * 4);
      for(let k=0; k<starburst; k++) {
         const angle = Math.random() * Math.PI * 2;
         const d = 0.5 + Math.random();
         this.spawnNebula({ x: a.x + Math.cos(angle)*d, y: a.y + Math.sin(angle)*d, vx: a.vx, vy: a.vy });
      }
      
      const typeMsg = mergerType === "MAJOR" ? "Structure disrupted -> Elliptical formed." : "Structure sustained.";
      this.addLog(`GALACTIC MERGER: ${a.name || a.id} consumed ${b.name || b.id} (${mergerType}). ${typeMsg}`, 'critical');
      this.pushNotification("COLLISION GALACTIQUE", `Fusion ${mergerType} entre ${a.name || a.id} et ${b.name || b.id}.`, 'system');
      return;
    }

    if (a.type === EntityType.BLACK_HOLE) {
      a.mass += b.mass;
      if (a.blackHoleStats) {
        a.blackHoleStats.consumedMass += b.mass;
        a.blackHoleStats.accretionDiskRadius += b.mass * 0.001;
      }
      this.state.entities.splice(bIdx, 1);
      if (Math.random() < 0.1) this.addLog(`EVENT_HORIZON: ${b.type} consumed by Black Hole.`, 'cosmic');
    }
    else if (a.type === EntityType.STAR && b.type === EntityType.NEBULA) {
      if (Math.random() > 0.42) this.spawnPlanet(a, b, bIdx);
      else { a.mass += b.mass * 0.18; this.state.entities.splice(bIdx, 1); }
    } 
    else if (a.type === EntityType.NEBULA && b.type === EntityType.NEBULA) {
      const tm = a.mass + b.mass;
      a.vx = (a.vx * a.mass + b.vx * b.mass) / tm;
      a.vy = (a.vy * a.mass + b.vy * b.mass) / tm;
      a.mass = tm;
      this.state.entities.splice(bIdx, 1);
    } 
    else if (a.type === EntityType.STAR && b.type === EntityType.STAR) {
      a.mass += b.mass;
      this.state.entities.splice(bIdx, 1);
      this.addLog(`STELLAR COLLISION: Stars merged into ${a.id}`, 'cosmic');
    } 
    else if ((a.type === EntityType.PLANET || a.type === EntityType.MOON) && (b.type === EntityType.NEBULA || b.type === EntityType.ASTEROID)) {
      a.mass += b.mass * 0.45;
      a.impactCounter = (a.impactCounter || 0) + 1;
      a.lastImpactTick = this.state.age;

      if (a.planetaryProfile) {
        a.planetaryProfile.atmosphereDensity += 0.05; 
        a.planetaryProfile.surfaceTemperature += 50; 
        a.planetaryProfile.prebioticInventory.aminoAcids += 2.0;

        if (!a.planetaryProfile.hasWater && Math.random() < 0.3) {
           a.planetaryProfile.hasWater = true;
           this.addLog(`IMPACT: Water delivered to ${a.name || a.id} by cometary impact.`, 'info');
        }

        if (a.bio) {
           a.bio.stability -= 0.5;
           a.habitability -= 0.4;
           if (Math.random() < 0.2) {
             a.bio = undefined;
             this.addLog(`EXTINCTION: Life wiped out on ${a.name || a.id} by impact.`, 'critical');
           }
        } else {
           a.habitability = Math.max(0, a.habitability - 0.15);
        }
      }
      this.state.entities.splice(bIdx, 1);
    }
  }

  private handleHabitabilityDynamics() {
    // 117 Ga Rule - Life is impossible before this time.
    if (this.state.realAge < this.LIFE_ORIGIN_THRESHOLD_YEARS) return; 
    
    this.state.entities.forEach(ent => {
      if (ent.type === EntityType.PLANET && ent.planetaryProfile) {
        const profile = ent.planetaryProfile;
        const parent = this.state.entities.find(e => e.id === ent.parentId);
        
        let baseTemp = 30; 
        let tidalHeat = 0;

        if (parent && parent.type === EntityType.STAR) {
            const dx = parent.x - ent.x;
            const dy = parent.y - ent.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            const starFactor = parent.temperature ? (parent.temperature / 5800) : 1;
            // Stefan-Boltzmann law approximation
            baseTemp = 288 * starFactor * Math.sqrt(1.5 / Math.max(0.1, dist)); 

            const tidalForce = (parent.mass) / Math.pow(Math.max(0.1, dist), 3);
            ent.tidalStress = tidalForce;
            tidalHeat = tidalForce * 5.0; 
            
            if (ent.lastImpactTick && (this.state.age - ent.lastImpactTick < 50)) {
               baseTemp += 50 * (1 - (this.state.age - ent.lastImpactTick)/50);
            }
        }

        const co2Effect = (profile.atmosphereComposition.co2 / 100) * 0.5;
        const methaneEffect = (profile.atmosphereComposition.methane / 100) * 12.0; 
        const pressureEffect = Math.log2(1 + profile.atmosphereDensity) * 15; 

        const greenhouse = pressureEffect + (pressureEffect * (co2Effect + methaneEffect));
        
        profile.surfaceTemperature = baseTemp + greenhouse + tidalHeat;
        const tempK = profile.surfaceTemperature;
        const pressureAtm = profile.atmosphereDensity;

        // Cryogenic Life Conditions (Late Universe)
        // Requires Cold Stability (< 150K) and Gravity
        const isCryoHabitable = tempK < 150 && tempK > 20 && ent.tidalStress > 0.05;

        let newHabitability = 0;
        
        if (isCryoHabitable) {
            newHabitability = 0.8; 
        }

        ent.habitability = Math.max(0, Math.min(1, newHabitability));

        // --- PREBIOTIC CHEMISTRY (LATE UNIVERSE VARIANT) ---
        if (!ent.bio && profile.prebioticInventory && isCryoHabitable) {
             let chemicalGrowth = 0.1;
             
             // Energy from Tidal Stress (Gravity) or Residual Decay
             if (ent.tidalStress > 0.1) chemicalGrowth += 0.2;
             
             // Time factor: Late universe chemistry is SLOW
             chemicalGrowth *= 0.05; 

             if (chemicalGrowth > 0) {
                 profile.prebioticInventory.aminoAcids += chemicalGrowth; // Abstract "complex structures"
                 if (profile.prebioticInventory.aminoAcids > 100) profile.prebioticInventory.lipids += chemicalGrowth;
                 if (profile.prebioticInventory.lipids > 100) profile.prebioticInventory.nucleotides += chemicalGrowth;
             }

             // --- BIOGENESIS THRESHOLD ---
             if (profile.prebioticInventory.nucleotides > 150) {
                 if (Math.random() < 0.001) { // Extremely rare
                    ent.bio = {
                        stage: LifeStage.PRE_RNA_SOUP,
                        complexity: 5, biomass: 1, stability: 1, dnaSequence: "CRYO_LATTICE",
                        cognitiveMarkers: { learning: 0, tools: 0, consciousness: 0, socialCohesion: 0 },
                        traits: ["Cryogenic", "Slow-Metabolism"]
                    };
                    this.notifyFirstLife(ent);
                    this.addLog(`ABIOGENESIS: Cryogenic Lattice formed on ${ent.name || ent.id}`, 'bio');
                 }
             }
        }

        if (ent.bio) this.evolve(ent);
      }
    });
  }

  // --- CIVILIZATION AGENCY ---
  private handleCivilizationActivity() {
    this.state.entities.forEach(ent => {
        if (!ent.bio || !ent.planetaryProfile) return;

        // Check if civilization is advanced enough to act
        const stageIdx = STAGE_ORDER.indexOf(ent.bio.stage);
        const sapienceIdx = STAGE_ORDER.indexOf(LifeStage.SAPIENT_COGNITION);

        if (stageIdx >= sapienceIdx) {
            // --- FIRST CONTACT CHECK ---
            if (!this.state.isContactEstablished) {
                this.triggerFirstContact(ent);
            }

            // 1. SELF-TERRAFORMING (Improving Habitability)
            if (ent.habitability < 0.9 && Math.random() < 0.02) {
                ent.habitability = Math.min(1.0, ent.habitability + 0.005);
                if (Math.random() < 0.1) {
                    this.addLog(`AGENCY: ${ent.name || ent.id} civilization performing geo-engineering.`, 'order');
                }
            }

            // 2. PLANETARY DEFENSE (Destroy Incoming Asteroids)
            // Detect nearby asteroids on collision course
            const nearbyDebris = this.state.entities.filter(other => 
                other.type === EntityType.ASTEROID && 
                Math.sqrt(Math.pow(ent.x - other.x, 2) + Math.pow(ent.y - other.y, 2)) < 3.0
            );

            nearbyDebris.forEach(asteroid => {
                // Determine if moving towards planet
                const dx = ent.x - asteroid.x;
                const dy = ent.y - asteroid.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Simple vector check: is asteroid moving generally towards planet?
                const dot = asteroid.vx * dx + asteroid.vy * dy;
                
                if (dot > 0 && Math.random() < 0.1) { // 10% chance per tick to intercept if approaching
                    // Intercept!
                    const asteroidIdx = this.state.entities.indexOf(asteroid);
                    if (asteroidIdx > -1) {
                        this.state.entities.splice(asteroidIdx, 1);
                        this.addLog(`DEFENSE: ${ent.name || ent.id} intercepted asteroid ${asteroid.id}.`, 'critical');
                        
                        // Tech boost for successful defense
                        ent.bio!.complexity += 5;
                    }
                }
            });
        }
    });
  }

  private triggerFirstContact(ent: Entity) {
      this.state.isContactEstablished = true;
      this.state.contactEntityId = ent.id;
      
      this.pushNotification(
          "PREMIER CONTACT", 
          `Signal intelligent détecté en provenance de ${ent.name || ent.id}. Canal sécurisé établi.`, 
          "life", 
          true
      );
      this.addLog("FIRST CONTACT: Sapient civilization attempting communication.", 'critical');
  }
  
  public getContactEntity(): Entity | undefined {
      if (!this.state.contactEntityId) return undefined;
      return this.state.entities.find(e => e.id === this.state.contactEntityId);
  }

  public addChatMessage(sender: 'USER' | 'CIVILIZATION', text: string) {
      this.state.chatHistory.push({
          id: Math.random().toString(36).substr(2, 9),
          sender,
          text,
          timestamp: Date.now()
      });
  }

  private notifyFirstLife(ent: Entity) {
    if (!this.hasLifeBornInUniverse) {
      this.hasLifeBornInUniverse = true;
      this.state.civilizationStats.biogenesisTimestamp = this.state.realAge;
      this.highestAchievedStage = LifeStage.PRE_RNA_SOUP;
      this.pushNotification("ORIGINE DE LA VIE", "Première forme de vie détectée dans l'univers (117 Ga+).", "life", true);
    }
    if (ent.isEarth && !this.hasLifeBornOnEarth) {
      this.hasLifeBornOnEarth = true;
      this.pushNotification("VIE SUR TERRE", "La vie a émergé sur Terre (Terra).", "life", true);
    }
    this.addLog(`BIO_SIGNAL: Life signatures emerging on ${ent.name || ent.id}.`, 'bio');
  }

  private evolve(ent: Entity) {
    if (!ent.bio || !ent.planetaryProfile) return;
    
    ent.bio.complexity += this.state.constants.mut * ent.habitability;

    const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(ent.bio.stage) + 1];
    if (nextStage && ent.bio.complexity > (STAGE_ORDER.indexOf(nextStage) * 65)) {
      ent.bio.stage = nextStage;
      this.addLog(`EVOL: Biosphere advanced to ${nextStage} on ${ent.name || ent.id}.`, 'bio');
      
      if (compareStages(nextStage, this.highestAchievedStage) > 0) {
        this.highestAchievedStage = nextStage;
        this.pushNotification(
          "ÉVOLUTION MAJEURE", 
          `Stade ${nextStage.replace(/_/g, ' ')} atteint sur ${ent.name || ent.id}.`, 
          "life", 
          true
        );
      }
    }
    this.updateEvolutionStats(this.highestAchievedStage);
  }

  private updateEvolutionStats(currentStage: LifeStage) {
    const stats = this.state.civilizationStats;
    const stageIndex = STAGE_ORDER.indexOf(currentStage);
    
    if (stageIndex >= 1 && stats.discoveredAcids.length < ACIDS.length) {
      const nextAcid = ACIDS[stats.discoveredAcids.length];
      if (nextAcid && Math.random() < 0.05) {
        stats.discoveredAcids.push(nextAcid);
        this.addLog(`CHEM_DISCOVERY: ${nextAcid} synthesized naturally.`, 'bio');
      }
    }
    if (stageIndex >= 4 && stats.discoveredCompounds.length < COMPOUNDS.length) {
      const nextComp = COMPOUNDS[stats.discoveredCompounds.length];
      if (nextComp && Math.random() < 0.05) {
        stats.discoveredCompounds.push(nextComp);
        this.addLog(`BIO_DISCOVERY: Complex ${nextComp} structure evolved.`, 'bio');
      }
    }
    if (stageIndex >= 7 && stats.discoveredMaterials.length < MATERIALS.length) {
      const nextMat = MATERIALS[stats.discoveredMaterials.length];
      if (nextMat && Math.random() < 0.05) {
        stats.discoveredMaterials.push(nextMat);
        this.addLog(`TECH_DISCOVERY: Civilization utilizes ${nextMat}.`, 'order');
      }
    }
    stats.civilizationProgress = Math.min(100, (stageIndex / 9) * 100);
  }

  private igniteStar(ent: Entity) {
    ent.type = EntityType.STAR;
    const initialMass = ent.mass;
    
    let spectralClass = 'M';
    let temp = 3000;
    let lifetime = 10000;
    let luminosity = 0.01;
    let radius = 1;

    ent.mass += initialMass < 250 ? 400 : (initialMass > 500 ? 2000 : 900);
    const m = ent.mass;

    if (m > 3500) { spectralClass = 'O'; temp = 35000; lifetime = 600; luminosity = 100; radius = 2.5; } 
    else if (m > 2500) { spectralClass = 'B'; temp = 20000; lifetime = 1200; luminosity = 50; radius = 2.0; } 
    else if (m > 1800) { spectralClass = 'A'; temp = 9000; lifetime = 2000; luminosity = 20; radius = 1.6; } 
    else if (m > 1400) { spectralClass = 'F'; temp = 7000; lifetime = 3500; luminosity = 5; radius = 1.3; } 
    else if (m > 900) { spectralClass = 'G'; temp = 5800; lifetime = 5000; luminosity = 1; radius = 1.0; } 
    else if (m > 500) { spectralClass = 'K'; temp = 4000; lifetime = 8000; luminosity = 0.4; radius = 0.8; } 
    else { spectralClass = 'M'; temp = 3000; lifetime = 15000; luminosity = 0.04; radius = 0.5; }

    ent.color = SPECTRAL_COLORS[spectralClass]; // Precise scientific color
    ent.temperature = temp;
    ent.radius = radius;
    ent.age = 0; 
    ent.stellarData = {
      stage: StellarEvolutionStage.MAIN_SEQUENCE,
      spectralClass,
      lifetime,
      luminosity
    };

    this.addLog(`STAR_BIRTH: Fusion initiated. Class: ${spectralClass} (${ent.temperature}K).`, 'cosmic');

    if (spectralClass === 'G' && this.state.realAge > 9_000_000_000 && !this.hasSolarSystemBorn) {
      this.hasSolarSystemBorn = true;
      ent.isSol = true;
      ent.name = "Sol (Soleil)";
      this.state.trackedEntityId = ent.id;
      this.state.zoomOverride = 6.0; 
      this.pushNotification("SYSTÈME SOLAIRE", "Le Système Solaire s'est formé autour de Sol.", "system");
    }
  }

  private handleStellarEvolution() {
    this.state.entities.forEach(ent => {
      if (ent.type === EntityType.STAR && ent.stellarData) {
        ent.age++; 

        const { lifetime, stage } = ent.stellarData;
        
        if (stage === StellarEvolutionStage.MAIN_SEQUENCE && ent.age > lifetime * 0.9) {
          ent.stellarData.stage = StellarEvolutionStage.RED_GIANT;
          ent.radius = (ent.radius || 1) * 3.5; 
          ent.color = '#dc2626'; 
          ent.temperature *= 0.6; 
          this.addLog(`STELLAR_EVOL: ${ent.name || ent.id} entering Giant Phase.`, 'cosmic');
        }

        if ((stage === StellarEvolutionStage.RED_GIANT || stage === StellarEvolutionStage.MAIN_SEQUENCE) && ent.age > lifetime) {
          this.triggerStellarDeath(ent);
        }
      }
    });
  }

  private triggerStellarDeath(ent: Entity) {
    if (!ent.stellarData) return;

    const mass = ent.mass;
    
    if (mass < 2500) {
      ent.stellarData.stage = StellarEvolutionStage.WHITE_DWARF;
      ent.radius = 0.3; 
      ent.color = SPECTRAL_COLORS['WD'];
      ent.temperature = 100000; 
      ent.mass *= 0.5; 
      ent.age = 0; 
      this.addLog(`STELLAR_DEATH: ${ent.name || ent.id} collapsed into White Dwarf.`, 'cosmic');
    } 
    else if (mass < 4500) {
      ent.stellarData.stage = StellarEvolutionStage.NEUTRON_STAR;
      ent.radius = 0.15; 
      ent.color = SPECTRAL_COLORS['NS']; 
      ent.temperature = 1000000;
      ent.mass *= 0.1;
      ent.age = 0; 
      this.pushNotification("SUPERNOVA", `Explosion massive détectée: ${ent.name || ent.id}`, 'stellar');
      this.addLog(`SUPERNOVA: ${ent.name || ent.id} detonated. Remnant: Neutron Star.`, 'critical');
    }
    else {
      this.spawnBlackHole(ent); 
      this.pushNotification("COLLAPSE", `Effondrement total: ${ent.name || ent.id} -> Trou Noir`, 'black_hole');
    }
  }

  private spawnPlanet(star: Entity, dust: Entity, idx: number) {
    const isEarthLike = Math.random() > 0.88;
    const p: Entity = {
      ...dust,
      type: EntityType.PLANET,
      parentId: star.id,
      color: isEarthLike ? '#10b981' : '#94a3b8',
      mass: 55 + Math.random() * 85,
      habitability: 0, 
      impactCounter: 0,
      planetaryProfile: {
        type: isEarthLike ? PlanetaryType.EARTH_LIKE : PlanetaryType.ROCKY,
        hasWater: isEarthLike,
        atmosphereDensity: isEarthLike ? 1.0 : Math.random() * 0.8,
        atmosphereComposition: isEarthLike ? 
          { oxygen: 21, nitrogen: 78, co2: 0.04, methane: 0.0002, argon: 0.9 } : 
          { oxygen: 0, nitrogen: 2, co2: 96, methane: 0, argon: 2 },
        magneticField: isEarthLike ? 0.9 : Math.random() * 0.2,
        gravityStability: 1.0,
        surfaceTemperature: 200,
        prebioticInventory: {
            aminoAcids: Math.random() * 5,
            nucleotides: Math.random() * 2,
            lipids: Math.random() * 5
        }
      }
    };
    
    if (star.isSol && isEarthLike && !this.hasEarthBorn) {
      this.hasEarthBorn = true;
      p.isEarth = true;
      p.name = "Terra (Terre)";
      this.state.trackedEntityId = p.id;
      this.state.zoomOverride = 45; 
      this.pushNotification("NAISSANCE TERRE", "La Terre est née dans le système Sol.", "earth", true);
    }

    this.setEllipticalOrbit(star, p);
    this.state.entities[idx] = p;
  }

  private setEllipticalOrbit(parent: Entity, child: Entity) {
    const dx = child.x - parent.x;
    const dy = child.y - parent.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 0.15;
    
    // Vis-viva equation for initial velocity v = sqrt(GM(2/r - 1/a))
    // We introduce eccentricity 'e' to make it elliptical, not perfectly circular
    const e = 0.1 + Math.random() * 0.4; // Eccentricity
    const vCircular = Math.sqrt(this.state.constants.G * parent.mass / dist);
    const vMag = vCircular * (1 - e * 0.5); // Vary velocity to create ellipse

    // Perpendicular vector
    const tx = -dy / dist;
    const ty = dx / dist;

    child.vx = parent.vx + tx * vMag;
    child.vy = parent.vy + ty * vMag;
  }

  private pushNotification(title: string, message: string, type: SimulationNotification['type'], persistent: boolean = false) {
    const notif: SimulationNotification = { id: Math.random().toString(36).substr(2, 9), title, message, type, persistent };
    if (persistent) {
      const persists = this.state.notifications.filter(n => n.persistent);
      const others = this.state.notifications.filter(n => !n.persistent).slice(0, 3);
      this.state.notifications = [notif, ...persists.slice(0, 2), ...others];
    } else {
      this.state.notifications.unshift(notif);
      if (this.state.notifications.length > 5) {
        const lastNonPersistent = this.state.notifications.reverse().findIndex(n => !n.persistent);
        if (lastNonPersistent !== -1) {
          this.state.notifications.splice(this.state.notifications.length - 1 - lastNonPersistent, 1);
        } else {
          this.state.notifications.pop();
        }
        this.state.notifications.reverse();
      }
    }
  }

  private updateStats(h: number) {
    let s=0, p=0, m=0, a=0, n=0, bh=0, gx=0, civs=0;
    let macroStars = 0;
    let macroPlanets = 0;
    let biospheres = 0;

    let maxStage = LifeStage.NONE;
    this.state.entities.forEach(e => {
      if (e.type === EntityType.STAR) s++;
      else if (e.type === EntityType.PLANET) p++;
      else if (e.type === EntityType.MOON) m++;
      else if (e.type === EntityType.ASTEROID) a++;
      else if (e.type === EntityType.BLACK_HOLE) bh++;
      else if (e.type === EntityType.GALAXY) {
        gx++;
        if (e.stellarCount) macroStars += e.stellarCount;
        if (e.planetCount) macroPlanets += e.planetCount;
      }
      else n++;
      
      if (e.bio) {
        biospheres++; 
        if (compareStages(e.bio.stage, maxStage) > 0) maxStage = e.bio.stage;
        if (compareStages(e.bio.stage, LifeStage.SAPIENT_COGNITION) >= 0) civs++;
      }
    });

    this.state.stats = {
      totalGalaxies: gx,
      totalStars: s + macroStars, 
      totalPlanets: p + macroPlanets, 
      totalMoons: m, 
      totalAsteroids: a, 
      totalNebulae: n,
      totalBlackHoles: bh,
      highestLifeStage: maxStage,
      expansionPressure: h,
      activeCivilizations: civs,
      totalBiospheres: biospheres
    };
  }

  public getState(): SimulationState { 
    return { ...this.state, entities: [...this.state.entities] }; 
  }

  public clearNotification(id: string) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
  }

  public setTracking(id?: string) {
    this.state.trackedEntityId = id;
    if (!id) this.state.zoomOverride = undefined;
  }

  public setViewOffset(x: number, y: number) {
    this.state.viewOffset = { x, y };
  }

  public getLogs() { return [...this.logs]; }
  private addLog(message: string, type: LogEntry['type']) {
    this.logs.unshift({ timestamp: Date.now(), message, type });
    if (this.logs.length > 40) this.logs.pop();
  }

  public applyOrder(order: any) {
    if (!order || order.CONSTRAINTS?.PHYSICS_SAFE === false) {
       this.addLog("ORDER REJECTED: Physics violation or malformed command.", 'warning');
       return;
    }
    
    const params = order.PARAMETERS || {};
    const scope = order.SCOPE;
    const action = order.ACTION;
    const targetType = order.TARGET;
    const targetName = order.TARGET_NAME;

    this.addLog(`ORDER_RECEIVED: ${action} ${targetType} [${scope}]`, 'order');

    if (targetType === 'UNIVERSE') {
        if (params.property === 'G') this.state.constants.G += (params.delta || 0);
        else if (params.property === 'H') this.state.constants.H += (params.delta || 0);
        else if (params.property === 'Lambda') this.state.constants.Lambda += (params.delta || 0);
        else if (params.property === 'mut') this.state.constants.mut += (params.delta || 0);
        this.addLog(`UNIVERSE CONSTANT MODIFIED: ${params.property}`, 'order');
        return;
    }

    let targets: Entity[] = [];
    if (scope === 'GLOBAL') {
        targets = this.state.entities.filter(e => e.type.toUpperCase() === targetType);
    } else {
        if (targetName) {
            targets = this.state.entities.filter(e => 
                (e.name?.toLowerCase().includes(targetName.toLowerCase())) || 
                (e.id === targetName)
            );
        } else if (this.state.trackedEntityId) {
             const tracked = this.state.entities.find(e => e.id === this.state.trackedEntityId);
             if (tracked && tracked.type.toUpperCase() === targetType) targets = [tracked];
        }
    }

    if (targets.length === 0) {
        this.addLog(`ORDER FAILED: No target found for ${targetName || targetType}.`, 'warning');
        return;
    }

    targets.forEach(e => {
        if (targetType === 'PLANET' && e.planetaryProfile) {
             if (params.property === 'surfaceTemperature') e.planetaryProfile.surfaceTemperature += (params.delta || 0);
             if (params.property === 'atmosphereDensity') e.planetaryProfile.atmosphereDensity = params.value ?? e.planetaryProfile.atmosphereDensity;
        }
        if (targetType === 'STAR') {
            if (action === 'ACCELERATE' && params.property === 'age') {
                e.age += (params.delta || 1000);
            }
        }
    });
  }
}
