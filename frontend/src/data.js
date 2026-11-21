export const promptVersions = [
  {
    id: "V1",
    title: "Basic weather chatbot",
    summary: "A friendly, concise answer to a direct weather question.",
    prompt: "You are a friendly weather chatbot. Answer the user's weather question briefly using the available weather data.",
  },
  {
    id: "V2",
    title: "Forecast + location context",
    summary: "Adds the requested place, current conditions, and relevant forecast context.",
    prompt: "You are a weather assistant. Identify the location in the user's question and use the provided weather and forecast context. Include relevant temperatures, conditions, rain chance, and a concise multi-day outlook when requested.",
  },
  {
    id: "V3",
    title: "Tools, verification + alerts",
    summary: "Checks API data, verifies the returned fields, and generates transparent rule-based alerts.",
    prompt: "You are a careful weather assistant. Identify the location, use the available weather lookup and forecast data, check the answer against the returned records, and generate a clear alert when conditions meet an alert rule. State when data is sample or unverified, and never present demo data as an official live advisory.",
  },
];

export const indianRegions = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const popularCities = [
  "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Jaipur", "Srinagar",
];

export function weatherDescription(code) {
  const descriptions = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle",
    55: "Dense drizzle", 61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers",
    81: "Moderate showers", 82: "Heavy showers", 95: "Thunderstorm",
    96: "Thunderstorm with hail", 99: "Severe thunderstorm",
  };
  return descriptions[code] || "Conditions unavailable";
}

export function getWeatherAlerts(weather) {
  const alerts = [];
  const rain = weather.daily.precipitation_probability_max?.[0];
  if (typeof rain === "number" && rain >= 70) alerts.push(`High rain chance (${rain}%)`);
  if (weather.current.wind_speed_10m >= 50) {
    alerts.push(`Strong wind (${Math.round(weather.current.wind_speed_10m)} km/h)`);
  }
  if (weather.current.temperature_2m >= 40) {
    alerts.push(`High temperature (${Math.round(weather.current.temperature_2m)}°C)`);
  }
  return alerts;
}

export function formatLocation(location) {
  return [location.name, location.admin1].filter(Boolean).join(", ");
}
