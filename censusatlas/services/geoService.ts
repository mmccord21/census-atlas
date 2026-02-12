import { CensusMetric } from '../types';
import { CENSUS_METRICS, CENSUS_API_KEY, STATE_FIPS } from '../constants';

// Public GeoJSON sources
const COUNTIES_URL = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';
// California Zip Codes (Sample for visualization performance)
const ZIPS_URL = 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/ca_california_zip_codes_geo.min.json';
const STATES_URL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

// Census API Config
const CENSUS_YEAR = '2021';
const CENSUS_DATASET = 'acs/acs5/profile'; // Data Profiles are easier to consume for standard metrics
const CENSUS_BASE_URL = `https://api.census.gov/data/${CENSUS_YEAR}/${CENSUS_DATASET}`;

export const fetchStateData = async () => {
  try {
    const response = await fetch(STATES_URL);
    if (!response.ok) throw new Error("Failed to fetch state data");
    return await response.json();
  } catch (err) {
    console.warn("State Data Fetch Error (non-critical):", err);
    return { type: 'FeatureCollection', features: [] };
  }
};

const processCensusRows = (headers: string[], rows: any[], level: 'county' | 'zip', dataMap: Record<string, any>) => {
    rows.forEach((row: any) => {
        if (!Array.isArray(row)) return;

        let id = '';
        if (level === 'county') {
            const stateIdx = headers.indexOf('state');
            const countyIdx = headers.indexOf('county');
            if (stateIdx > -1 && countyIdx > -1 && row[stateIdx] && row[countyIdx]) {
                id = row[stateIdx] + row[countyIdx];
            }
        } else {
            const zipIdx = headers.indexOf('zip code tabulation area');
            if (zipIdx > -1 && row[zipIdx]) {
                id = row[zipIdx];
            }
        }

        if (id) {
            const metrics: Record<string, number> = {};
            CENSUS_METRICS.forEach(metric => {
                const idx = headers.indexOf(metric.apiVariable);
                if (idx > -1) {
                    const val = parseFloat(row[idx]);
                    // Census uses -666666666 etc for null/annotation
                    // We check for valid positive number or 0
                    metrics[metric.id] = (isNaN(val) || val < 0) ? 0 : val;
                } else {
                    metrics[metric.id] = 0;
                }
            });
            dataMap[id] = metrics;
        }
    });
};

const fetchCensusStats = async (level: 'county' | 'zip') => {
    if (!CENSUS_API_KEY) {
        console.error("Census API Key is missing. Check your .env file.");
        return {};
    }

    const variables = CENSUS_METRICS.map(m => m.apiVariable).join(',');
    const getParams = `NAME,${variables}`;

    const dataMap: Record<string, Record<string, number>> = {};

    if (level === 'county') {
        // Parallel Fetch for each state
        const promises = STATE_FIPS.map(async (fips) => {
            const url = `${CENSUS_BASE_URL}?get=${getParams}&for=county:*&in=state:${fips}&key=${CENSUS_API_KEY}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    // console.warn(`Failed to fetch stats for state ${fips}`, response.status);
                    return null;
                }
                return await response.json();
            } catch (err) {
                console.error(`Network error for state ${fips}`, err);
                return null;
            }
        });

        const results = await Promise.all(promises);

        results.forEach(json => {
            if (json && Array.isArray(json) && json.length > 1) {
                const headers = json[0] as string[];
                const rows = json.slice(1);
                processCensusRows(headers, rows, level, dataMap);
            }
        });

    } else {
        // Zip Codes: Must fetch all or nothing as state filtering is not reliable for ZCTAs in API
        const url = `${CENSUS_BASE_URL}?get=${getParams}&for=zip%20code%20tabulation%20area:*&key=${CENSUS_API_KEY}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn("Census API request failed for Zips", response.status);
                return {};
            }
            const json = await response.json();
             if (json && Array.isArray(json) && json.length > 1) {
                const headers = json[0] as string[];
                const rows = json.slice(1);
                processCensusRows(headers, rows, level, dataMap);
            }
        } catch (e) {
            console.error("Error fetching zip stats:", e);
        }
    }

    return dataMap;
};

export const fetchGeoData = async (level: 'county' | 'zip') => {
  const geoUrl = level === 'county' ? COUNTIES_URL : ZIPS_URL;
  
  try {
    const [geoResponse, censusData] = await Promise.all([
        fetch(geoUrl),
        fetchCensusStats(level)
    ]);

    if (!geoResponse.ok) throw new Error(`Failed to fetch ${level} geometry`);
    
    const geoJson = await geoResponse.json();

    if (!geoJson.features) {
        return { type: 'FeatureCollection', features: [] };
    }

    geoJson.features = geoJson.features.map((feature: any) => {
        const properties = feature.properties || {};
        
        let id = '';
        let name = '';

        if (level === 'county') {
            // Normalize FIPS ID
            id = feature.id || properties.GEO_ID || properties.FIPS || '';
            // Handle GeoJSONs where GEO_ID might be "0500000US01001"
            if (id.length > 5 && id.includes('US')) {
                id = id.split('US')[1];
            }
            name = properties.NAME || 'Unknown County'; 
        } else {
            id = properties.ZCTA5CE10 || properties.ZCTA || '';
            name = id ? `Zip ${id}` : 'Unknown Zip';
        }

        const stats = censusData[id] || {};

        const newProperties: any = {
            id: id,
            name: name,
            ...stats 
        };

        // Default missing metrics to 0
        CENSUS_METRICS.forEach(m => {
            if (newProperties[m.id] === undefined) newProperties[m.id] = 0;
        });

        return {
            ...feature,
            id: id,
            properties: newProperties
        };
    });

    return geoJson;
  } catch (err) {
    console.error("Geo Data Fetch Error:", err);
    return { type: 'FeatureCollection', features: [] };
  }
};