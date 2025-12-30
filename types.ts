
export enum OrderTarget {
  UNIVERSE = 'UNIVERSE',
  GALAXY = 'GALAXY',
  STAR = 'STAR',
  PLANET = 'PLANET',
  MOON = 'MOON',
  SPECIES = 'SPECIES',
  INDIVIDUAL = 'INDIVIDUAL',
  DNA = 'DNA',
  CELL = 'CELL'
}

export enum OrderScope {
  LOCAL = 'LOCAL',
  REGIONAL = 'REGIONAL',
  GLOBAL = 'GLOBAL'
}

export enum OrderAction {
  MODIFY = 'MODIFY',
  ACCELERATE = 'ACCELERATE',
  INHIBIT = 'INHIBIT',
  MUTATE = 'MUTATE',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK'
}

export enum EntityType {
  GALAXY = 'galaxy',
  NEBULA = 'nebula',
  STAR = 'star',
  PLANET = 'planet',
  MOON = 'moon',
  ASTEROID = 'asteroid',
  BLACK_HOLE = 'black_hole'
}

export interface PhysicalConstants {
  G: number;
  H: number; // Hubble Constant (Expansion)
  Lambda: number; // Dark Energy (Anti-gravity)
  DM: number;
  c: number;
  ent: number;
  mut: number;
  OmegaM: number;
  OmegaL: number;
  StarFormationThreshold: number;
  PlanetFormationThreshold: number;
}

export enum LifeStage {
  NONE = 'NONE',
  PRE_RNA_SOUP = 'PRE_RNA_SOUP',
  CATALYTIC_RNA = 'CATALYTIC_RNA',
  LIPID_VESICLE = 'LIPID_VESICLE',
  GENOMIC_DNA = 'GENOMIC_DNA',
  CELLULAR_PROKARYOTE = 'CELLULAR_PROKARYOTE',
  MULTICELLULAR_EUKARYOTE = 'MULTICELLULAR_EUKARYOTE',
  SAPIENT_COGNITION = 'SAPIENT_COGNITION',
  INTERSTELLAR_SOCIETY = 'INTERSTELLAR_SOCIETY',
  TECHNOLOGICAL_SINGULARITY = 'TECHNOLOGICAL_SINGULARITY'
}

export const STAGE_ORDER = [
  LifeStage.NONE,
  LifeStage.PRE_RNA_SOUP,
  LifeStage.CATALYTIC_RNA,
  LifeStage.LIPID_VESICLE,
  LifeStage.GENOMIC_DNA,
  LifeStage.CELLULAR_PROKARYOTE,
  LifeStage.MULTICELLULAR_EUKARYOTE,
  LifeStage.SAPIENT_COGNITION,
  LifeStage.INTERSTELLAR_SOCIETY,
  LifeStage.TECHNOLOGICAL_SINGULARITY
];

export const compareStages = (s1: LifeStage, s2: LifeStage) => {
  return STAGE_ORDER.indexOf(s1) - STAGE_ORDER.indexOf(s2);
};

export interface BiologicalData {
  stage: LifeStage;
  complexity: number;
  biomass: number;
  stability: number;
  dnaSequence: string; 
  cognitiveMarkers: {
    learning: number;
    tools: number;
    consciousness: number;
    socialCohesion: number;
  };
  traits: string[];
}

export enum PlanetaryType {
  GAS_GIANT = 'GAS_GIANT',
  ROCKY = 'ROCKY',
  EARTH_LIKE = 'EARTH_LIKE',
  OCEAN_WORLD = 'OCEAN_WORLD',
  LAVA_WORLD = 'LAVA_WORLD'
}

export interface AtmosphericComposition {
  oxygen: number;
  nitrogen: number;
  co2: number;
  methane: number;
  argon: number;
}

export interface PrebioticInventory {
  aminoAcids: number; // 0 to 100+
  nucleotides: number; // 0 to 100+
  lipids: number; // 0 to 100+
}

export enum StellarEvolutionStage {
  PROTOSTAR = 'PROTOSTAR',
  MAIN_SEQUENCE = 'MAIN_SEQUENCE',
  RED_GIANT = 'RED_GIANT',
  SUPERGIANT = 'SUPERGIANT',
  WHITE_DWARF = 'WHITE_DWARF',
  NEUTRON_STAR = 'NEUTRON_STAR',
  SUPERNOVA_REMNANT = 'SUPERNOVA_REMNANT'
}

export enum GalaxyType {
  SPIRAL = 'SPIRAL',
  ELLIPTICAL = 'ELLIPTICAL',
  IRREGULAR = 'IRREGULAR',
  LENTICULAR = 'LENTICULAR'
}

export interface Entity {
  id: string;
  name?: string;
  type: EntityType;
  parentId?: string; 
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  age: number;
  energy: number;
  temperature: number;
  color: string;
  radius?: number; // Visual radius multiplier
  bio?: BiologicalData;
  habitability: number;
  tidalStress: number;
  impactCounter: number;
  lastImpactTick?: number;
  isEarth?: boolean;
  isSol?: boolean;
  // Stats for Macro Entities (Galaxies)
  stellarCount?: number;
  planetCount?: number;
  galaxyData?: {
    type: GalaxyType;
    rotationSpeed: number;
    armCount?: number; // For spirals
  };
  // Star specific data
  stellarData?: {
    stage: StellarEvolutionStage;
    spectralClass: string; // O, B, A, F, G, K, M
    lifetime: number; // in ticks
    luminosity: number;
  };
  blackHoleStats?: {
    accretionDiskRadius: number;
    consumedMass: number;
  };
  planetaryProfile?: {
    type: PlanetaryType;
    hasWater: boolean;
    atmosphereDensity: number; // 0 to 10
    atmosphereComposition: AtmosphericComposition;
    magneticField: number; // 0 to 1 (Protection from radiation)
    gravityStability: number;
    surfaceTemperature: number; // Kelvin
    prebioticInventory: PrebioticInventory;
  };
}

export enum CosmicEpoch {
  SINGULARITY = 'SINGULARITY',
  INFLATION = 'INFLATION',
  RECOMBINATION = 'RECOMBINATION',
  DARK_AGES = 'DARK_AGES',
  STELLARIFEROUS = 'STELLARIFEROUS',
  LIFE_BEARING = 'LIFE_BEARING'
}

export interface SimulationNotification {
  id: string;
  title: string;
  message: string;
  type: 'earth' | 'life' | 'stellar' | 'system' | 'black_hole';
  persistent?: boolean;
}

export interface CivilizationStats {
  biogenesisTimestamp: number; // Real Age when life first appeared
  discoveredAcids: string[]; // e.g., Glycine, Alanine
  discoveredCompounds: string[]; // e.g., Lipids, Chlorophyll
  discoveredMaterials: string[]; // e.g., Bronze, Silicon, Antimatter
  civilizationProgress: number; // 0 to 100% towards Type I
}

export interface ChatMessage {
    id: string;
    sender: 'USER' | 'CIVILIZATION';
    text: string;
    timestamp: number;
}

export interface SimulationState {
  age: number; 
  realAge: number; 
  explosionProgress: number; 
  cosmicTemperature: number;
  entities: Entity[];
  constants: PhysicalConstants;
  entropy: number;
  isBigBangOccurred: boolean;
  cosmicEpoch: CosmicEpoch;
  trackedEntityId?: string;
  viewOffset: { x: number; y: number }; // Manual camera position
  notifications: SimulationNotification[];
  zoomOverride?: number; // New field to force visualizer zoom
  stats: {
    totalGalaxies: number;
    totalStars: number;
    totalPlanets: number;
    totalMoons: number;
    totalAsteroids: number;
    totalNebulae: number;
    totalBlackHoles: number;
    highestLifeStage: LifeStage;
    expansionPressure: number;
    activeCivilizations: number;
    totalBiospheres: number; // New: Tracks total planets with life (any stage)
  };
  civilizationStats: CivilizationStats;
  
  // First Contact State
  isContactEstablished: boolean;
  contactEntityId?: string;
  chatHistory: ChatMessage[];
}

export interface LogEntry {
  timestamp: number;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'order' | 'bio' | 'cosmic';
}
