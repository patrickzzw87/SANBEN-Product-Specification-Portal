
export interface ElectricalSpec {
  inputVoltage: string;
  inputCurrent: string;
  ratedPower: string;
  powerFactor: string;
  thd: string;
  driverClass?: string;
}

export interface OpticalSpecRow {
  cct: string;
  lumen: string;
  efficacy: string;
  sdcm: string;
  cri: string;
  angle: string;
}

export interface MechanicalSpec {
  material: string;
  finish: string;
  optic: string; // For track, this might be 'N/A' or insulation material
  adjustability: string;
  ip: string;
  weight: string;
  cutout?: string; // Optional for recessed
}

export interface NamingPart {
  code: string;
  label: string;
  desc: string;
  color: string;
}

export interface ConeItem {
  distance: string;
  lux: string;
  diameter: string;
  barWidth: string; // Percentage for visual bar
}

export interface PolarDataPoint {
  angle: string;
  A: number;
}

export interface OpticalGraphData {
  beamAngle: string;
  coneData: ConeItem[];
  polarData: PolarDataPoint[];
}

export interface ProductConfig {
  id: string;
  name: string;
  model: string;
  series: string;
  appType: string;
  descriptionPrompt: string;
  defaultDescription: string;
  electrical: ElectricalSpec;
  optical?: OpticalSpecRow[]; // Optional for Accessories
  mechanical: MechanicalSpec;
  naming: NamingPart[];
  features: string[];
  standards: string[];
  docRev: string;
  imageUrl: string;
  opticalGraph?: OpticalGraphData; // Optional for Accessories
  packing?: string[]; // New field for accessories
  installation?: string; // New field for accessories
}
