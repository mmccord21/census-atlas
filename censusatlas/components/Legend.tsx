import React from 'react';
import { CensusMetric } from '../types';
import './Legend.css';

interface LegendProps {
  metric: CensusMetric;
  min?: number;
  max?: number;
}

const Legend: React.FC<LegendProps> = ({ metric, min, max }) => {
  // Use passed min/max or fallback to metric defaults if not yet calculated
  const displayMin = min !== undefined ? min : metric.min;
  const displayMax = max !== undefined ? max : metric.max;

  const formatValue = (val: number) => {
    if (val === undefined || val === null) return '...';
    
    if (metric.unit === 'currency') {
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
      return `$${Math.round(val).toLocaleString()}`;
    }
    if (metric.unit === 'percent') {
      return `${val.toFixed(1)}%`;
    }
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return Math.round(val).toLocaleString();
  };

  // Create gradient string from color scale. 
  // Note: Dynamic style is necessary here for data-driven visualization.
  const gradient = `linear-gradient(to right, ${metric.colorScale.join(', ')})`;

  return (
    <div className="legend-container">
      <div className="legend-header">
        <h4 className="legend-title">{metric.label}</h4>
        <span className="legend-unit">{metric.unit}</span>
      </div>
      
      {/* Gradient Bar */}
      <div className="legend-bar" style={{ background: gradient }}>
      </div>

      {/* Min/Max Labels */}
      <div className="legend-labels">
        <span>{formatValue(displayMin)}</span>
        <span>{formatValue(displayMax)}</span>
      </div>
      
      <p className="legend-description">
        {metric.description}
      </p>
    </div>
  );
};

export default Legend;