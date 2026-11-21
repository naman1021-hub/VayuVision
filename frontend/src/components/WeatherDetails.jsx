import { formatLocation, getWeatherAlerts, weatherDescription } from "../data.js";

export default function WeatherDetails({ location, weather, showAlerts = false }) {
  const alerts = getWeatherAlerts(weather);
  const current = weather.current;
  return (
    <section className="weather-detail">
      <div className="weather-detail-top">
        <div>
          <span className="eyebrow">CURRENT CONDITIONS</span>
          <h2>{formatLocation(location)}</h2>
        </div>
        <span className="source-pill"><span /> Live forecast</span>
      </div>
      <div className="current-summary">
        <div className="current-temperature">{Math.round(current.temperature_2m)}<span>°</span></div>
        <div className="current-description">
          <strong>{weatherDescription(current.weather_code)}</strong>
          <span>Feels like {Math.round(current.apparent_temperature)}°C</span>
        </div>
      </div>
      <div className="metric-grid">
        <Metric label="Humidity" value={`${Math.round(current.relative_humidity_2m)}%`} />
        <Metric label="Rain chance" value={`${weather.daily.precipitation_probability_max?.[0] ?? "—"}%`} />
        <Metric label="Wind" value={`${Math.round(current.wind_speed_10m)} km/h`} />
      </div>
      <div className="forecast-heading"><h3>5-day forecast</h3><span>{weather.timezone}</span></div>
      <div className="daily-grid">
        {weather.daily.time.map((day, index) => (
          <div className="daily-item" key={day}>
            <span className="daily-date">{new Date(`${day}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}</span>
            <strong>{weatherDescription(weather.daily.weather_code[index])}</strong>
            <span className="daily-range">{Math.round(weather.daily.temperature_2m_min[index])}° <span>/</span> {Math.round(weather.daily.temperature_2m_max[index])}°</span>
            <span className="daily-rain">{weather.daily.precipitation_probability_max[index] ?? "—"}% rain</span>
          </div>
        ))}
      </div>
      {showAlerts && (
        <div className={`alert-result ${alerts.length ? "alert-result-warning" : ""}`}>
          <span className="alert-result-icon">{alerts.length ? "!" : "✓"}</span>
          <div>
            <strong>{alerts.length ? "Conditions to watch" : "No rule-based alerts detected"}</strong>
            <p>{alerts.length ? alerts.join(" · ") : "No high-rain, high-wind, or high-temperature thresholds were met."} This check is informational and is not an official government advisory.</p>
          </div>
        </div>
      )}
      <p className="attribution">Forecast by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · Updated {new Date(current.time).toLocaleString()}</p>
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}
