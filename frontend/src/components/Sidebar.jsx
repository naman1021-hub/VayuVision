import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/", label: "Chat", icon: "chat" },
  { to: "/map", label: "Weather map", icon: "map" },
  { to: "/alerts", label: "Saved alerts", icon: "alerts" },
  { to: "/prompts", label: "Prompt versions", icon: "prompts", count: "3" },
];

function Icon({ name }) {
  const paths = {
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-2 2v-9.5A7.5 7.5 0 0 1 10.5 4H12" /><path d="M16 3v6M13 6h6" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    alerts: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    prompts: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Sidebar({ mobileOpen, closeMobile, onNewChat, onToast }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  function chooseRecent(question) {
    navigate("/", { state: { question, stamp: Date.now() } });
    closeMobile();
  }

  function profileAction(message) {
    setProfileOpen(false);
    onToast(message);
  }

  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" onClick={closeMobile} aria-label="Close navigation" />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <NavLink to="/" className="brand" onClick={closeMobile}>
          <span className="brand-mark" aria-hidden="true"><img src="/favicon.svg" alt="" /></span>
          <span className="brand-name">Vayu<span>Vision</span></span>
        </NavLink>

        <button className="sidebar-new-chat" onClick={onNewChat}>
          <span>＋</span> New conversation
        </button>

        <nav className="nav-list" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={closeMobile}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
              {link.count && <span className="nav-count">{link.count}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="recent-section">
          <p className="section-label">Recent chats</p>
          <button className="recent-chat" onClick={() => chooseRecent("What is the forecast in Delhi for this week?")}>Delhi weekly forecast</button>
          <button className="recent-chat" onClick={() => chooseRecent("Will it rain in Mumbai this week?")}>Monsoon in Mumbai</button>
          <button className="recent-chat" onClick={() => chooseRecent("Check weather alerts in Chennai")}>Chennai weather alerts</button>
        </div>

        <div className="sidebar-footer">
          <div className="profile">
            <div className="avatar">AK</div>
            <div className="profile-copy"><strong>Arjun Kumar</strong><span>Weather enthusiast</span></div>
            <button className="profile-trigger" onClick={() => setProfileOpen((open) => !open)} aria-label="Open profile menu" aria-expanded={profileOpen}>•••</button>
            {profileOpen && (
              <div className="profile-menu">
                <button onClick={() => profileAction("Account settings are not connected in this demo.")}>Account settings</button>
                <button onClick={() => profileAction("VayuVision is running in demo mode.")}>About this demo</button>
              </div>
            )}
          </div>
          <span className="sidebar-note">India weather · powered by Open-Meteo</span>
        </div>
      </aside>
    </>
  );
}
