import { useState } from "react";
import { getForecast, searchIndianLocations } from "../api.js";
import { formatLocation } from "../data.js";
import WeatherDetails from "../components/WeatherDetails.jsx";

function readSavedAlerts() {
  try {
    return JSON.parse(localStorage.getItem("vayuvision-alert-locations") || "[]");
  } catch {
    return [];
  }
}

export default function AlertsPage() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState(null);
  const [saved, setSaved] = useState(readSavedAlerts);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submitSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError("");
    setMatches([]);
    setWeather(null);
    setSelected(null);
    try {
      const result = await searchIndianLocations(query.trim());
      setMatches(result.locations);
      if (!result.locations.length) setError(`No Indian locations found for “${query.trim()}”.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function checkLocation(location) {
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

  function saveLocation() {
    if (!selected) return;
    const next = [
      selected,
      ...saved.filter((item) => item.latitude !== selected.latitude || item.longitude !== selected.longitude),
    ];
    setSaved(next);
    localStorage.setItem("vayuvision-alert-locations", JSON.stringify(next));
  }

  function removeLocation(location) {
    const next = saved.filter((item) => item.latitude !== location.latitude || item.longitude !== location.longitude);
    setSaved(next);
    localStorage.setItem("vayuvision-alert-locations", JSON.stringify(next));
  }

  return (
    <div className="page-content">
      <div className="page-intro">
        <span className="eyebrow">STAY PREPARED</span>
        <h2>Weather checks for places you care about.</h2>
        <p>Review forecast-based conditions and save locations to check again later.</p>
      </div>
      <div className="notice-banner"><span>i</span><p>These are automated checks of forecast thresholds, not official government alerts. Always follow local authority guidance.</p></div>
      <form className="search-bar" onSubmit={submitSearch}>
        <span className="search-icon">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a city, district, or state…" aria-label="Find a location to check" />
        <button className="button-primary" disabled={busy}>{busy ? "Checking…" : "Find location"}</button>
      </form>
      {error && <div className="inline-error" role="alert">{error}</div>}
      {matches.length > 0 && (
        <div className="location-list alert-location-list">
          {matches.map((location) => (
            <button key={`${location.latitude}-${location.longitude}`} className="location-option" onClick={() => checkLocation(location)}>
              <span className="location-pin">⌖</span>
              <span><strong>{location.name}</strong><small>{[location.admin2, location.admin1].filter(Boolean).join(", ")}</small></span>
              <span className="location-arrow">Check →</span>
            </button>
          ))}
        </div>
      )}
      {busy && selected && <div className="loading-card">Checking forecast thresholds…</div>}
      {selected && weather && (
        <>
          <WeatherDetails location={selected} weather={weather} showAlerts />
          <button className="button-secondary save-alert-button" onClick={saveLocation}>＋ Save this location</button>
        </>
      )}
      <section className="saved-alerts-section">
        <div className="section-heading"><div><span className="eyebrow">YOUR LIST</span><h3>Saved locations</h3></div><span>{saved.length} saved</span></div>
        {saved.length ? (
          <div className="saved-location-list">
            {saved.map((location) => (
              <div className="saved-location" key={`${location.latitude}-${location.longitude}`}>
                <span className="saved-location-mark">⌖</span>
                <div><strong>{formatLocation(location)}</strong><small>Forecast-based checks</small></div>
                <button className="text-button" onClick={() => checkLocation(location)}>Check now</button>
                <button className="remove-button" onClick={() => removeLocation(location)} aria-label={`Remove ${location.name}`}>×</button>
              </div>
            ))}
          </div>
        ) : <p className="muted-copy">No saved locations yet. Search for a place and save it to keep it here.</p>}
      </section>
    </div>
  );
}
