export type GeoLevel = 'county' | 'zip';

export interface CensusMetric {
  id: string;
  label: string;
  description: string;
  category: 'demographics' | 'economics' | 'housing' | 'education';
  unit: 'count' | 'currency' | 'percent' | 'age';
  min: number; // For visualization scaling
  max: number; // For visualization scaling
  colorScale: string[]; // Hex codes
  apiVariable: string; // US Census Bureau Variable ID
  logarithmic?: boolean; // Enable logarithmic scaling for skewed data
}

export interface CensusFeatureProperties {
  id: string; // FIPS or ZIP
  name: string;
  [key: string]: number | string; // Dynamic metrics
}

export interface MapState {
  center: [number, number];
  zoom: number;
  hoveredFeature: CensusFeatureProperties | null;
}

export interface USState {
  name: string;
  fips: string;
}