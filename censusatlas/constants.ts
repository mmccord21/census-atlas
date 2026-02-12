import { CensusMetric, USState } from './types';

export const CENSUS_METRICS: CensusMetric[] = [
  {
    id: 'population',
    label: 'Total Population',
    description: 'Total population count estimate (2021 ACS).',
    category: 'demographics',
    unit: 'count',
    min: 0,
    max: 1000000, // Adjusted default
    colorScale: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'], // Reds
    apiVariable: 'DP05_0001E',
    logarithmic: true
  },
  {
    id: 'median_income',
    label: 'Median Household Income',
    description: 'The midpoint of the income distribution of households (2021 ACS).',
    category: 'economics',
    unit: 'currency',
    min: 25000,
    max: 120000,
    colorScale: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'], // Greens
    apiVariable: 'DP03_0062E'
  },
  {
    id: 'median_age',
    label: 'Median Age',
    description: 'The age that divides the population into two numerically equal groups.',
    category: 'demographics',
    unit: 'age',
    min: 25,
    max: 60,
    colorScale: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'], // Blues
    apiVariable: 'DP05_0018E'
  },
  {
    id: 'unemployment_rate',
    label: 'Unemployment Rate',
    description: 'The percentage of the civilian labor force that is jobless.',
    category: 'economics',
    unit: 'percent',
    min: 0,
    max: 15,
    colorScale: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486'], // Purples
    apiVariable: 'DP03_0009PE'
  },
  {
    id: 'bachelors_degree',
    label: 'Bachelor\'s Degree or Higher',
    description: 'Percentage of adults 25+ with a bachelor\'s degree or higher.',
    category: 'education',
    unit: 'percent',
    min: 10,
    max: 75,
    colorScale: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#005a32'], // YlGn
    apiVariable: 'DP02_0068PE'
  }
];

export const MAP_CENTER_DEFAULT: [number, number] = [-98.5795, 39.8283]; // USA Center
export const MAP_ZOOM_DEFAULT = 4;

// Production Security: Use environment variable. 
// If running locally without a build system, you may temporarily replace this string, 
// but do not commit real keys to GitHub.
export const CENSUS_API_KEY = (import.meta as any).env?.VITE_CENSUS_API_KEY || '18194c8facbdaea7356f8d15aa061f26cac14d72';

export const US_STATES: USState[] = [
  { name: 'Alabama', fips: '01' },
  { name: 'Alaska', fips: '02' },
  { name: 'Arizona', fips: '04' },
  { name: 'Arkansas', fips: '05' },
  { name: 'California', fips: '06' },
  { name: 'Colorado', fips: '08' },
  { name: 'Connecticut', fips: '09' },
  { name: 'Delaware', fips: '10' },
  { name: 'District of Columbia', fips: '11' },
  { name: 'Florida', fips: '12' },
  { name: 'Georgia', fips: '13' },
  { name: 'Hawaii', fips: '15' },
  { name: 'Idaho', fips: '16' },
  { name: 'Illinois', fips: '17' },
  { name: 'Indiana', fips: '18' },
  { name: 'Iowa', fips: '19' },
  { name: 'Kansas', fips: '20' },
  { name: 'Kentucky', fips: '21' },
  { name: 'Louisiana', fips: '22' },
  { name: 'Maine', fips: '23' },
  { name: 'Maryland', fips: '24' },
  { name: 'Massachusetts', fips: '25' },
  { name: 'Michigan', fips: '26' },
  { name: 'Minnesota', fips: '27' },
  { name: 'Mississippi', fips: '28' },
  { name: 'Missouri', fips: '29' },
  { name: 'Montana', fips: '30' },
  { name: 'Nebraska', fips: '31' },
  { name: 'Nevada', fips: '32' },
  { name: 'New Hampshire', fips: '33' },
  { name: 'New Jersey', fips: '34' },
  { name: 'New Mexico', fips: '35' },
  { name: 'New York', fips: '36' },
  { name: 'North Carolina', fips: '37' },
  { name: 'North Dakota', fips: '38' },
  { name: 'Ohio', fips: '39' },
  { name: 'Oklahoma', fips: '40' },
  { name: 'Oregon', fips: '41' },
  { name: 'Pennsylvania', fips: '42' },
  { name: 'Rhode Island', fips: '44' },
  { name: 'South Carolina', fips: '45' },
  { name: 'South Dakota', fips: '46' },
  { name: 'Tennessee', fips: '47' },
  { name: 'Texas', fips: '48' },
  { name: 'Utah', fips: '49' },
  { name: 'Vermont', fips: '50' },
  { name: 'Virginia', fips: '51' },
  { name: 'Washington', fips: '53' },
  { name: 'West Virginia', fips: '54' },
  { name: 'Wisconsin', fips: '55' },
  { name: 'Wyoming', fips: '56' }
];

export const STATE_FIPS = US_STATES.map(s => s.fips);