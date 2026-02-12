import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/Map';
import Legend from './components/Legend';
import { CENSUS_METRICS } from './constants';
import { CensusMetric, USState } from './types';
import './App.css';

const App: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<CensusMetric>(CENSUS_METRICS[0]);
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [dataRange, setDataRange] = useState<{min: number, max: number} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar 
        selectedMetric={selectedMetric} 
        onMetricChange={setSelectedMetric}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="main-content">
        <button 
          className="mobile-toggle-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Map Controls"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <MapComponent 
          metric={selectedMetric}
          selectedState={selectedState}
          geoLevel="county"
          onRangeChange={setDataRange}
        />
        
        <Legend 
          metric={selectedMetric} 
          min={dataRange?.min}
          max={dataRange?.max}
        />
      </main>
    </div>
  );
};

export default App;