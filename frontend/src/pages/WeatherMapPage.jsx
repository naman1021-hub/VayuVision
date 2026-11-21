import { useState } from "react";
import { getForecast, searchIndianLocations } from "../api.js";
import { formatLocation, indianRegions, popularCities } from "../data.js";
import WeatherDetails from "../components/WeatherDetails.jsx";

export default function WeatherMapPage() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [regionNotice, setRegionNotice] = useState("");

  async function search(value = query) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setBusy(true);
    setError("");
    setWeather(null);
    setSelected(null);
    try {
      const result = await searchIndianLocations(trimmed);
      setLocations(result.locations);
      setRegionNotice(result.representativeCity
        ? `${result.requestedRegion} is shown through its representative city, ${result.representativeCity}.`
        : "");
      if (!result.locations.length) setError(`No Indian locations found for “${trimmed}”. Try a city, district, or state name.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function chooseLocation(location) {
    setSelected(location);
    setWeather(null);
    setError("");
    setBusy(true);
    try {
      setWeather(await getForecast(location));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-content">
      <div className="page-intro">
        <span className="eyebrow">EXPLORE INDIA</span>
        <h2>Weather, wherever you are.</h2>
        <p>Search supported cities, districts, and state locations across India for a current forecast.</p>
      </div>
      <form className="search-bar" onSubmit={(event) => { event.preventDefault(); search(); }}>
        <span className="search-icon">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a city, district, or state…" aria-label="Search a location" />
        <button className="button-primary" disabled={busy}>{busy ? "Searching…" : "Search weather"}</button>
      </form>
      <div className="quick-search">
        <span>Popular:</span>
        {popularCities.map((city) => <button key={city} onClick={() => search(city)}>{city}</button>)}
      </div>
      <details className="region-browser">
        <summary>Browse all 28 states and 8 union territories</summary>
        <div className="region-list">
          {indianRegions.map((region) => <button key={region} onClick={() => search(region)}>{region}</button>)}
        </div>
      </details>

      {error && <div className="inline-error" role="alert">{error}</div>}
      {locations.length > 0 && (
        <section className="location-results">
          <div className="section-heading"><h3>Matching locations</h3><span>{locations.length} results</span></div>
          {regionNotice && <p className="region-notice">{regionNotice}</p>}
          <div className="location-list">
            {locations.map((location) => (
              <button key={`${location.latitude}-${location.longitude}`} className={`location-option ${selected === location ? "selected" : ""}`} onClick={() => chooseLocation(location)}>
                <span className="location-pin">⌖</span>
                <span><strong>{location.name}</strong><small>{[location.admin2, location.admin1].filter(Boolean).join(", ")}</small></span>
                <span className="location-arrow">→</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {busy && selected && <div className="loading-card">Loading current conditions and five-day forecast…</div>}
      {selected && weather && <WeatherDetails location={selected} weather={weather} />}
      {!locations.length && !busy && !error && (
        <div className="empty-state">
          <div className="empty-weather-icon">☀</div>
          <h3>Your next forecast starts here</h3>
          <p>Search a place or choose one of the popular cities to explore current conditions.</p>
        </div>
      )}
      <p className="data-note">Location search is powered by Open-Meteo Geocoding. Availability depends on its place database.</p>
    </div>
  );
}
