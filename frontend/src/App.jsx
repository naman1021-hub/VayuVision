import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import PromptVersionsPage from "./pages/PromptVersionsPage.jsx";
import WeatherMapPage from "./pages/WeatherMapPage.jsx";

const pageMeta = {
  "/": { title: "Weather assistant", eyebrow: "INDIA WEATHER" },
  "/map": { title: "Explore weather", eyebrow: "LOCATION FORECASTS" },
  "/alerts": { title: "Weather checks", eyebrow: "SAVED LOCATIONS" },
  "/prompts": { title: "Prompt versions", eyebrow: "ASSISTANT CONFIGURATION" },
};

function getStoredVersion() {
  try {
    const saved = localStorage.getItem("vayuvision-prompt-version");
    return ["V1", "V2", "V3"].includes(saved) ? saved : "V3";
  } catch {
    return "V3";
  }
}

export default function App() {
  const [activeVersion, setActiveVersion] = useState(getStoredVersion);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const meta = pageMeta[location.pathname] || pageMeta["/"];

  useEffect(() => {
    try {
      localStorage.setItem("vayuvision-prompt-version", activeVersion);
    } catch {
      setToast("Prompt version could not be saved in this browser.");
    }
  }, [activeVersion]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function newChat() {
    navigate("/", { state: { newChat: Date.now() } });
    setMobileOpen(false);
  }

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
        onNewChat={newChat}
        onToast={setToast}
      />
      <main className="main-panel">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">☰</button>
          <div className="topbar-title">
            <span>{meta.eyebrow}</span>
            <h1>{meta.title}</h1>
          </div>
          <div className="topbar-actions">
            <span className="api-status"><i /> Forecast API</span>
            {location.pathname === "/" && <button className="button-secondary top-new-chat" onClick={newChat}>＋ <span>New chat</span></button>}
          </div>
        </header>
        <Routes>
          <Route path="/" element={<ChatPage activeVersion={activeVersion} />} />
          <Route path="/map" element={<WeatherMapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/prompts" element={<PromptVersionsPage activeVersion={activeVersion} onSelectVersion={setActiveVersion} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <footer className="global-footer">
          <span>VayuVision · Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span>
          <Link to="/prompts">Prompt history</Link>
        </footer>
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
