# VayuVision

VayuVision is a weather assistant for exploring Indian locations, viewing five-day forecasts, checking forecast-based weather thresholds, and comparing three recorded assistant prompt versions.

## Features

- **Chat:** Ask for current conditions, forecasts, or weather-based checks in a city, district, or state.
- **Weather map:** Search the Open-Meteo location database and view current conditions and a five-day outlook.
- **Indian regions:** Browse all 28 states and 8 union territories. State searches use a representative city; city searches use the provider's geocoding results.
- **Saved alerts:** Check and save locations in the browser. Rule-based notices use forecast thresholds and are not official weather warnings.
- **Prompt versions:** Compare V1 (basic answer), V2 (forecast and location context), and V3 (data checks and alert generation). The selected version is saved in browser storage.
- **Live provider data:** Location and forecast requests are made through the Express API to Open-Meteo. No API key is required.

## Requirements

- Node.js 20 or newer
- npm
- Internet access for Open-Meteo location and forecast requests

## Run locally

From the project root:

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The development command starts both services:

- React + Vite frontend: `http://localhost:5173`
- Express API: `http://localhost:4000`

Vite proxies `/api` requests to the backend. The backend port can be changed with the `PORT` environment variable.

## Build

Create a production frontend bundle:

```sh
npm run build
```

The generated frontend files are written to `frontend/dist/` and are intentionally excluded from Git. For deployment, serve that directory with a static host and configure `/api` requests to reach the Express backend.

To run only the API:

```sh
npm run start
```

## Project structure

```text
backend/
  src/server.js                 Express API and Open-Meteo proxy
frontend/
  src/
    components/                 Shared sidebar and weather components
    pages/                      Chat, map, alerts, and prompt pages
    App.jsx                     Layout and route configuration
    api.js                      Frontend API client
    data.js                     Prompt versions and weather helpers
    styles.css                  Responsive application styles
  public/favicon.svg
package.json                    npm workspaces and root commands
```

## API endpoints

### `GET /api/health`

Returns the API service status.

### `GET /api/locations?query=Pune`

Searches for Indian locations and returns matching names, administrative areas, coordinates, and time zones. Queries matching a state or union territory return results for its representative city.

### `GET /api/weather?latitude=18.52&longitude=73.86`

Returns current conditions and a five-day forecast for the supplied coordinates. Latitude and longitude are validated by the backend.

## Data and alert limitations

Forecasts and location results are provided by [Open-Meteo](https://open-meteo.com/). Coverage depends on the provider's location database and service availability; the app does not bundle an exhaustive offline gazetteer of every Indian locality.

The alert checker highlights forecast thresholds (rain probability of at least 70%, wind speed of at least 50 km/h, or temperature of at least 40°C). These are illustrative application rules, not official advisories. Always verify warnings with the relevant local authority.
