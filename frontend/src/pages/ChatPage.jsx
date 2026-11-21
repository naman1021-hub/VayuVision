import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getForecast, searchIndianLocations } from "../api.js";
import { formatLocation, getWeatherAlerts, promptVersions, weatherDescription } from "../data.js";

function extractLocation(prompt) {
  const match = prompt.match(/\b(?:in|at|for|near|around)\s+(.+?)(?=\s+(?:today|now|right now|this week|tomorrow|next week|currently|please)\b|[?.!,]|$)/i);
  if (match) return match[1].trim();
  return prompt
    .replace(/^(what(?:'s| is)?|how is|tell me|show me)\s+/i, "")
    .replace(/\b(weather|forecast|temperature|conditions|rain|alerts?|in india)\b/gi, "")
    .replace(/[?.!,]/g, "")
    .trim();
}

async function answerWeatherQuestion(prompt, version) {
  const placeQuery = extractLocation(prompt);
  if (!placeQuery || placeQuery.toLowerCase() === "india") {
    return { text: "Which Indian city or state should I check? For example, try Pune, Assam, or Ladakh." };
  }

  const result = await searchIndianLocations(placeQuery);
  if (!result.locations.length) {
    return { text: `I couldn't find “${placeQuery}” in India's location database. Try a nearby city, district, or state.` };
  }
  const location = result.locations.find((item) => item.name.toLowerCase() === placeQuery.toLowerCase()) || result.locations[0];
  const weather = await getForecast(location);
  const current = weather.current;
  const daily = weather.daily;
  if (!Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code)) {
    throw new Error("The weather provider returned incomplete conditions for this location.");
  }
  const name = formatLocation(location);
  const alerts = getWeatherAlerts(weather);
  const asksForAlerts = /\b(alert|warning|advisory|danger)\b/i.test(prompt);
  const asksForForecast = /\b(rain|week|forecast|tomorrow|next few days)\b/i.test(prompt);

  if (version === "V1") {
    return { text: `${name}: ${Math.round(current.temperature_2m)}°C, ${weatherDescription(current.weather_code).toLowerCase()}.` };
  }

  if (asksForAlerts && version === "V3") {
    const rain = daily.precipitation_probability_max?.[0];
    return {
      text: alerts.length
        ? `Weather-based alert for ${name}: ${alerts.join(" and ")}. This rule-based notice uses forecast data and is not an official warning.`
        : `No alert thresholds were met for ${name} in the current forecast. This does not confirm the absence of official advisories.`,
      cards: [
        ["Rain chance", `${rain ?? "—"}%`],
        ["Wind", `${Math.round(current.wind_speed_10m)} km/h`],
        ["Checked", "Forecast data"],
      ],
      verified: true,
    };
  }

  const cards = [
    ["Temperature", `${Math.round(current.temperature_2m)}°C`],
    ["Conditions", weatherDescription(current.weather_code)],
    ["Feels like", `${Math.round(current.apparent_temperature)}°C`],
  ];
  if (version === "V3") {
    cards.push(["Rain chance", `${daily.precipitation_probability_max?.[0] ?? "—"}%`]);
    cards.push(["Wind", `${Math.round(current.wind_speed_10m)} km/h`]);
  }
  if (asksForForecast) {
    daily.time.slice(0, 3).forEach((date, index) => {
      cards.push([
        new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short" }),
        `${Math.round(daily.temperature_2m_min[index])}°–${Math.round(daily.temperature_2m_max[index])}° · ${daily.precipitation_probability_max[index] ?? "—"}% rain`,
      ]);
    });
  }
  return {
    text: `For ${name}, it is ${Math.round(current.temperature_2m)}°C with ${weatherDescription(current.weather_code).toLowerCase()}. ${asksForForecast ? "Here is the upcoming forecast." : `Feels like ${Math.round(current.apparent_temperature)}°C, with winds around ${Math.round(current.wind_speed_10m)} km/h.`}`,
    cards,
    verified: version === "V3",
  };
}

const starterQuestions = [
  "What's the weather in Delhi today?",
  "Will it rain in Mumbai this week?",
  "Any weather alerts in Chennai?",
];

export default function ChatPage({ activeVersion }) {
  const [messages, setMessages] = useState([{
    id: "welcome",
    role: "assistant",
    text: "Hello, I’m VayuVision. Ask for current conditions, a forecast, or a weather-based alert in any Indian city or state.",
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.newChat) {
      setMessages([{ id: `welcome-${location.state.newChat}`, role: "assistant", text: "New conversation started. Which Indian city or state would you like to check?" }]);
      setInput("");
    } else if (location.state?.question) {
      send(location.state.question);
    }
  }, [location.state?.stamp, location.state?.newChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(question) {
    const prompt = question.trim();
    if (!prompt || busy) return;
    setMessages((items) => [...items, { id: crypto.randomUUID(), role: "user", text: prompt }]);
    setInput("");
    setBusy(true);
    try {
      const response = await answerWeatherQuestion(prompt, activeVersion);
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: "assistant", ...response }]);
    } catch (error) {
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: "assistant", text: error.message || "Could not load forecast data. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  const version = promptVersions.find((item) => item.id === activeVersion);

  return (
    <div className="chat-page">
      <div className="chat-welcome">
        <span className="welcome-mark"><img src="/favicon.svg" alt="" /></span>
        <span className="eyebrow">YOUR INDIA WEATHER ASSISTANT</span>
        <h2>Weather, made clearer.</h2>
        <p>Forecasts and conditions for places across India, in a conversation.</p>
      </div>
      <div className="conversation" ref={scrollRef} aria-live="polite">
        {messages.map((message) => (
          <div className={`message-row message-${message.role}`} key={message.id}>
            {message.role === "assistant" && <div className="assistant-avatar">V</div>}
            <div className="message-content">
              {message.role === "assistant" && <div className="message-author">VayuVision <span>·</span> {activeVersion}</div>}
              <div className="message-bubble">{message.text}</div>
              {message.cards?.length > 0 && (
                <div className="chat-weather-cards">
                  {message.cards.map(([label, value], index) => <div className="chat-weather-card" key={`${label}-${index}`}><span>{label}</span><strong>{value}</strong></div>)}
                </div>
              )}
              {message.verified && <p className="verification-note">✓ Response fields checked against Open-Meteo · Generated guidance is not official</p>}
            </div>
          </div>
        ))}
        {busy && <div className="message-row message-assistant"><div className="assistant-avatar">V</div><div className="message-content"><div className="message-author">VayuVision</div><div className="message-bubble typing"><i /><i /><i /></div></div></div>}
      </div>
      {messages.length === 1 && (
        <div className="starter-questions">{starterQuestions.map((question) => <button key={question} onClick={() => send(question)}>{question}<span>↗</span></button>)}</div>
      )}
      <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send(input); }}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about weather in a city, district, or state…" aria-label="Ask VayuVision" />
        <button className="send-button" disabled={busy || !input.trim()} aria-label="Send message"><span>↑</span></button>
      </form>
      <p className="chat-disclaimer">Using prompt {activeVersion} · {version?.title} · Forecasts by Open-Meteo · Verify official alerts locally.</p>
    </div>
  );
}
