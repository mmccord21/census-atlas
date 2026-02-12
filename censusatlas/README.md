# CensusAtlas

**CensusAtlas** is a professional geospatial visualization tool designed to analyze US Census data trends across counties and zip codes using interactive heatmaps.

![CensusAtlas Social Preview](https://censusatlas.app/social-preview.png)

## Features

- **Interactive Heatmaps**: Visualize demographic data on a map using OpenLayers.
- **Granular Data**: Switch between County-level (FIPS) and Zip-code level data.
- **Rich Datasets**:
  - Total Population (Logarithmic scale)
  - Median Household Income
  - Median Age
  - Unemployment Rate
  - Education Levels (Bachelor's Degree+)
- **Responsive Design**: Fully responsive sidebar and map controls for desktop and mobile.
- **Performance**: Optimized Vector styling and efficient GeoJSON handling.

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Mapping Engine**: OpenLayers
- **Styling**: CSS Modules, TailwindCSS (via CDN)
- **Data Source**: US Census Bureau API (ACS 5-Year Estimates)
- **Build Tool**: Vite (implied)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- API Key from US Census Bureau (Optional for basic viewing, required for live data fetching)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/census-atlas.git
   cd census-atlas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env` file in the root directory:
   ```env
   VITE_CENSUS_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/src`: Source code
  - `/components`: UI components (Map, Sidebar, Legend)
  - `/services`: API and GeoJSON fetching logic
  - `/constants`: Configuration for metrics and map defaults
  - `/types`: TypeScript interfaces

## License

MIT
