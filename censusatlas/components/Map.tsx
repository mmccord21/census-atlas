import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { unByKey } from 'ol/Observable';
import { easeOut } from 'ol/easing';
import { CensusMetric, GeoLevel, USState } from '../types';
import { fetchGeoData, fetchStateData } from '../services/geoService';
import { MAP_CENTER_DEFAULT, MAP_ZOOM_DEFAULT } from '../constants';
import './Map.css';

interface MapComponentProps {
  metric: CensusMetric;
  geoLevel: GeoLevel;
  selectedState: USState | null;
  onRangeChange: (range: {min: number, max: number}) => void;
}

// Optimization: Create static styles to avoid garbage collection churn
const DIMMED_STYLE = new Style({
  fill: new Fill({ color: 'rgba(0,0,0,0.75)' }), // Darker dim for better contrast
  stroke: new Stroke({ color: 'rgba(255,255,255,0.05)', width: 0.5 })
});

const DEFAULT_STROKE = new Stroke({
  color: 'rgba(0,0,0,0.1)',
  width: 0.5
});

const MapComponent: React.FC<MapComponentProps> = ({ metric, geoLevel, selectedState, onRangeChange }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const popupElement = useRef<HTMLDivElement>(null);
  
  // Refs for OpenLayers instances
  const mapRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const stateSourceRef = useRef<VectorSource | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  
  // State to track if features are loaded so we can recalculate styles
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  const [dynamicRange, setDynamicRange] = useState<{min: number, max: number}>({ min: metric.min, max: metric.max });

  const [hoverInfo, setHoverInfo] = useState<{name: string; value: string | number} | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing Map...");

  // Helper: Interpolate color based on dynamic range
  const getColorForValue = (value: number, m: CensusMetric, range: {min: number, max: number}) => {
    if (value === undefined || value === null || isNaN(value)) {
        return 'rgba(0,0,0,0)'; 
    }

    // Handle Logarithmic Scales (e.g. Population)
    if (m.logarithmic) {
        // Ensure values are >= 1 for log calculation
        const safeVal = Math.max(value, 1);
        const safeMin = Math.max(range.min, 1);
        const safeMax = Math.max(range.max, 1);

        const logVal = Math.log(safeVal);
        const logMin = Math.log(safeMin);
        const logMax = Math.log(safeMax);
        
        // Avoid division by zero if all values are same
        if (logMax === logMin) {
             return m.colorScale[Math.floor(m.colorScale.length / 2)];
        }

        let pct = (logVal - logMin) / (logMax - logMin);
        pct = Math.max(0, Math.min(1, pct));
        
        const index = Math.floor(pct * (m.colorScale.length - 1));
        return m.colorScale[index] || m.colorScale[m.colorScale.length - 1];
    }
    
    // Handle Linear Scales
    const min = range.min;
    const max = range.max === range.min ? range.min + 1 : range.max;

    let pct = (value - min) / (max - min);
    
    pct = Math.max(0, Math.min(1, pct));
    const index = Math.floor(pct * (m.colorScale.length - 1));
    return m.colorScale[index] || m.colorScale[m.colorScale.length - 1];
  };

  // 1. Initialize Map (Run once)
  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    const rasterLayer = new TileLayer({
      source: new OSM(),
      className: 'ol-layer-dark', 
      opacity: 0.7,
    });

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
         stroke: new Stroke({ color: '#000000', width: 0.3 }),
         fill: new Fill({ color: 'rgba(0,0,0,0)' })
      }),
      opacity: 0.9,
      zIndex: 2
    });
    vectorLayerRef.current = vectorLayer;

    const stateSource = new VectorSource();
    stateSourceRef.current = stateSource;

    const stateLayer = new VectorLayer({
      source: stateSource,
      style: new Style({
        fill: new Fill({ color: 'rgba(0,0,0,0)' }),
        stroke: new Stroke({
          color: '#333333',
          width: 1.5 
        })
      }),
      zIndex: 3 
    });

    fetchStateData().then(data => {
        if (data && data.features) {
            stateSource.addFeatures(new GeoJSON().readFeatures(data, { featureProjection: 'EPSG:3857' }));
        }
    });

    const overlay = new Overlay({
      element: popupElement.current!,
      autoPan: false,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10]
    });
    overlayRef.current = overlay;

    const map = new Map({
      target: mapElement.current,
      layers: [rasterLayer, vectorLayer, stateLayer],
      view: new View({
        center: fromLonLat(MAP_CENTER_DEFAULT),
        zoom: MAP_ZOOM_DEFAULT,
        minZoom: 3,
        // constrainResolution: true // Removed to allow smooth fractional zooming
      }),
      overlays: [overlay],
      controls: [] 
    });
    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // 2. Fetch Data (Run when geoLevel changes)
  useEffect(() => {
    const map = mapRef.current;
    const vectorLayer = vectorLayerRef.current;
    if (!map || !vectorLayer) return;
    
    let isMounted = true;

    const fetchData = async () => {
        setIsLoading(true);
        setLoadingMessage("Fetching US Counties...");
        setFeaturesLoaded(false);
        
        try {
            const data = await fetchGeoData(geoLevel);
            
            if (!isMounted) return;

            const source = vectorLayer.getSource();
            if (source && data && data.features) {
                source.clear();
                
                const features = new GeoJSON().readFeatures(data, {
                    featureProjection: 'EPSG:3857', 
                });
                
                if (features.length > 0) {
                    source.addFeatures(features);
                    setFeaturesLoaded(true);
                }
            }
        } catch (error) {
            console.error("Failed to load map data", error);
        } finally {
            if (isMounted) setIsLoading(false);
        }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [geoLevel]);

  // 3. Zoom to State (Run when selectedState changes)
  useEffect(() => {
    const map = mapRef.current;
    const source = stateSourceRef.current;
    
    if (!map || !source) return;

    if (!selectedState) {
        // Reset to default view with smooth animation
        map.getView().animate({
            center: fromLonLat(MAP_CENTER_DEFAULT),
            zoom: MAP_ZOOM_DEFAULT,
            duration: 1000,
            easing: easeOut
        });
        return;
    }

    const zoomToFeature = () => {
        const features = source.getFeatures();
        // Try to match by Name or assume property 'NAME' exists from geojson-us-states
        const stateFeature = features.find(f => {
            const props = f.getProperties();
            const name = props.NAME || props.name;
            return name === selectedState.name;
        });

        if (stateFeature) {
            const extent = stateFeature.getGeometry()?.getExtent();
            if (extent) {
                map.getView().fit(extent, {
                    padding: [50, 50, 50, 50],
                    duration: 1000,
                    easing: easeOut
                });
            }
        }
    };

    // If source isn't ready, wait for change event
    if (source.getFeatures().length > 0) {
        zoomToFeature();
    } else {
        const key = source.on('change', () => {
             if (source.getState() === 'ready') {
                 zoomToFeature();
                 unByKey(key);
             }
        });
    }

  }, [selectedState]);

  // 4. Calculate Range & Update Style (Run when Metric, Features load, or State Selection changes)
  useEffect(() => {
    const vectorLayer = vectorLayerRef.current;
    if (!vectorLayer || !featuresLoaded) return;

    const source = vectorLayer.getSource();
    if (!source) return;

    const features = source.getFeatures();
    
    // Determine which features are relevant for calculation
    let featuresToCalculate = features;

    if (selectedState) {
        featuresToCalculate = features.filter(f => {
            const id = f.get('id');
            // Check if feature ID (FIPS) starts with state FIPS
            return id && String(id).startsWith(selectedState.fips);
        });
    }

    // Calculate Min/Max for the current selection
    let min = Infinity;
    let max = -Infinity;
    let hasData = false;

    featuresToCalculate.forEach(f => {
        const val = f.get(metric.id);
        if (typeof val === 'number') {
            if (val < min) min = val;
            if (val > max) max = val;
            hasData = true;
        }
    });

    if (!hasData) {
        min = metric.min;
        max = metric.max;
    }

    // Update local state and parent state
    const newRange = { min, max };
    setDynamicRange(newRange);
    onRangeChange(newRange);

    // Apply Style
    const styleFunction = (feature: any) => {
        const id = feature.get('id');
        const strId = String(id);
        
        // If a state is selected, dim features outside of it
        if (selectedState && (!id || !strId.startsWith(selectedState.fips))) {
             return DIMMED_STYLE;
        }

        const val = feature.get(metric.id);
        const color = getColorForValue(val, metric, newRange);
        
        return new Style({
            fill: new Fill({ color: color }),
            stroke: DEFAULT_STROKE
        });
    };

    vectorLayer.setStyle(styleFunction);

  }, [metric, featuresLoaded, selectedState]);
  
  // Ref for metric to use in event handler
  const metricRef = useRef(metric);
  useEffect(() => { metricRef.current = metric; }, [metric]);

  // 5. Interaction Handler
  useEffect(() => {
    const map = mapRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;

    const pointerMoveKey = map.on('pointermove', (evt) => {
        if (evt.dragging) {
          overlay.setPosition(undefined);
          return;
        }
  
        const feature = map.forEachFeatureAtPixel(evt.pixel, (feat, layer) => {
          return layer === vectorLayerRef.current ? feat : null;
        });
  
        const element = map.getTargetElement();
        if (element) {
          element.style.cursor = feature ? 'pointer' : '';
        }
  
        if (feature) {
          const props = feature.getProperties();
          const currentMetric = metricRef.current;
          const val = props[currentMetric.id];
  
          let formattedVal: string | number = 'N/A';
          
          if (typeof val === 'number') {
              if (currentMetric.unit === 'currency') {
                  formattedVal = `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              } else if (currentMetric.unit === 'percent') {
                  formattedVal = `${val.toFixed(1)}%`;
              } else {
                  formattedVal = val.toLocaleString();
              }
          }
  
          setHoverInfo({
              name: props.name || 'Unknown Region',
              value: formattedVal
          });
          overlay.setPosition(evt.coordinate);
        } else {
          setHoverInfo(null);
          overlay.setPosition(undefined);
        }
      });

      return () => {
          unByKey(pointerMoveKey);
      }
  }, [metric]); // Re-bind when metric changes

  return (
    <div className="map-wrapper">
      <div ref={mapElement} className="map-element" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
           <div className="loading-content">
             <div className="spinner"></div>
             <h3 className="loading-text">{loadingMessage}</h3>
             <p className="loading-subtext">Loading geospatial vectors...</p>
           </div>
        </div>
      )}

      {/* Popup Overlay */}
      <div ref={popupElement} className="ol-popup">
        {hoverInfo && (
            <div>
                <div className="popup-title">{hoverInfo.name}</div>
                <div className="popup-stat">
                    <span className="popup-label">{metric.label}:</span>
                    <span className="popup-value">{hoverInfo.value}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;