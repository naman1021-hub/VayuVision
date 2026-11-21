import express from "express";

const app = express();
const port = Number(process.env.PORT) || 4000;
const regionCities = new Map([
  ["andhra pradesh", "Vijayawada"],
  ["arunachal pradesh", "Itanagar"],
  ["assam", "Guwahati"],
  ["bihar", "Patna"],
  ["chhattisgarh", "Raipur"],
  ["goa", "Panaji"],
  ["gujarat", "Gandhinagar"],
  ["haryana", "Gurugram"],
  ["himachal pradesh", "Shimla"],
  ["jharkhand", "Ranchi"],
  ["karnataka", "Bengaluru"],
  ["kerala", "Thiruvananthapuram"],
  ["madhya pradesh", "Bhopal"],
  ["maharashtra", "Mumbai"],
  ["manipur", "Imphal"],
  ["meghalaya", "Shillong"],
  ["mizoram", "Aizawl"],
  ["nagaland", "Kohima"],
  ["odisha", "Bhubaneswar"],
  ["punjab", "Ludhiana"],
  ["rajasthan", "Jaipur"],
  ["sikkim", "Gangtok"],
  ["tamil nadu", "Chennai"],
  ["telangana", "Hyderabad"],
  ["tripura", "Agartala"],
  ["uttar pradesh", "Lucknow"],
  ["uttarakhand", "Dehradun"],
  ["west bengal", "Kolkata"],
  ["andaman and nicobar islands", "Port Blair"],
  ["chandigarh", "Chandigarh"],
  ["dadra and nagar haveli and daman and diu", "Daman"],
  ["delhi", "Delhi"],
  ["jammu and kashmir", "Srinagar"],
  ["ladakh", "Leh"],
  ["lakshadweep", "Kavaratti"],
  ["puducherry", "Puducherry"],
]);

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "VayuVision API" });
});

app.get("/api/locations", async (request, response) => {
  const query = typeof request.query.query === "string" ? request.query.query.trim() : "";
  if (!query || query.length > 100) {
    return response.status(400).json({ error: "Provide a location query between 1 and 100 characters." });
  }

  try {
    const regionCity = regionCities.get(query.toLowerCase().replace(/\s+/g, " "));
    const searchTerm = regionCity || query;
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({
      name: searchTerm,
      count: "10",
      language: "en",
      format: "json",
      countryCode: "IN",
    });
    const upstream = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!upstream.ok) {
      return response.status(502).json({ error: "Location data provider is temporarily unavailable." });
    }
    const payload = await upstream.json();
    const locations = (payload.results || [])
      .filter((place) => place.country_code === "IN")
      .map((place) => ({
        id: place.id,
        name: place.name,
        admin1: place.admin1 || "",
        admin2: place.admin2 || "",
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone || "",
        requestedRegion: regionCity ? query : null,
      }));
    return response.json({
      locations,
      source: "Open-Meteo Geocoding API",
      requestedRegion: regionCity ? query : null,
      representativeCity: regionCity || null,
    });
  } catch (error) {
    console.error("Location lookup failed:", error);
    return response.status(502).json({ error: "Location lookup failed. Please try again shortly." });
  }
});

app.get("/api/weather", async (request, response) => {
  const latitude = Number(request.query.latitude);
  const longitude = Number(request.query.longitude);
  if (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90
    || !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  ) {
    return response.status(400).json({ error: "Valid latitude and longitude coordinates are required." });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone: "auto",
      forecast_days: "5",
    });
    const upstream = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!upstream.ok) {
      return response.status(502).json({ error: "Weather data provider is temporarily unavailable." });
    }
    const payload = await upstream.json();
    if (!payload.current || !payload.daily) {
      return response.status(502).json({ error: "Weather provider returned incomplete forecast data." });
    }
    return response.json({ ...payload, source: "Open-Meteo Forecast API" });
  } catch (error) {
    console.error("Weather lookup failed:", error);
    return response.status(502).json({ error: "Weather lookup failed. Please try again shortly." });
  }
});

app.listen(port, () => {
  console.log(`VayuVision API listening on http://localhost:${port}`);
});
