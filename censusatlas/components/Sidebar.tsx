import React from 'react';
import { CENSUS_METRICS, US_STATES } from '../constants';
import { CensusMetric, USState } from '../types';
import './Sidebar.css';

interface SidebarProps {
  selectedMetric: CensusMetric;
  onMetricChange: (metric: CensusMetric) => void;
  selectedState: USState | null;
  onStateChange: (state: USState | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedMetric, 
  onMetricChange,
  selectedState,
  onStateChange,
  isOpen,
  onClose
}) => {
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside 
        className={`sidebar-container ${isOpen ? 'open' : ''}`}
        aria-label="Map Controls"
      >
        {/* Header */}
        <header className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="logo-title">CensusAtlas</h1>
          </div>
          <p className="sidebar-subtitle">US Demographic Intelligence Platform</p>
        </header>

        {/* Scrollable Content */}
        <nav className="sidebar-scroll-area" aria-label="Main Navigation">
          
          {/* Region Selection */}
          <section className="control-section">
            <h3>Geographic Region</h3>
            <div className="select-wrapper">
                  <label htmlFor="state-select" className="sr-only">Select US State</label>
                  <select 
                    id="state-select"
                    value={selectedState?.fips || ""}
                    onChange={(e) => {
                      const fips = e.target.value;
                      if (!fips) {
                        onStateChange(null);
                      } else {
                        const state = US_STATES.find(s => s.fips === fips);
                        if (state) onStateChange(state);
                      }
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    className="styled-select"
                  >
                    <option value="">All United States</option>
                    {US_STATES.map(state => (
                      <option key={state.fips} value={state.fips}>{state.name}</option>
                    ))}
                  </select>
                  <div className="select-icon">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
            </div>
          </section>

          {/* Metric Selection */}
          <section className="control-section">
            <h3>Data Dataset</h3>
            <div role="radiogroup" aria-label="Select Data Metric">
              {CENSUS_METRICS.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => {
                    onMetricChange(metric);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`metric-button ${selectedMetric.id === metric.id ? 'active' : 'inactive'}`}
                  aria-pressed={selectedMetric.id === metric.id}
                  role="radio"
                  aria-checked={selectedMetric.id === metric.id}
                >
                  <div className="metric-header">
                    <span className={`metric-title ${selectedMetric.id === metric.id ? 'active' : 'inactive'}`}>
                      {metric.label}
                    </span>
                    {selectedMetric.id === metric.id && (
                      <span className="active-indicator"></span>
                    )}
                  </div>
                  <p className="metric-desc">
                    {metric.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </nav>

        {/* Footer / Status */}
        <footer className="sidebar-footer">
          <div className="status-bar">
            <span className="status-indicator">
              <span className="status-dot"></span>
              System Operational
            </span>
            <span>v1.2.0</span>
          </div>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;