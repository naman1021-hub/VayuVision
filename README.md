# VayuVision

A React weather assistant for searching locations across India, viewing forecasts, checking rule-based weather thresholds, and comparing three recorded prompt versions.

## Run locally

1. Install the workspace dependencies from the project root:

   ```sh
   npm install
   ```

2. Start the frontend and backend together:

   ```sh
   npm run dev
   ```

3. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The React frontend lives in `frontend/`; the Express API lives in `backend/`. The backend proxies location and forecast requests to the Open-Meteo Geocoding and Forecast APIs. The frontend searches the provider's India location database rather than bundling a static list of every locality.

Rule-based notices are informational and are not official government weather alerts.
