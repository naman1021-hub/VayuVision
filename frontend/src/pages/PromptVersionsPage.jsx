import { promptVersions } from "../data.js";

export default function PromptVersionsPage({ activeVersion, onSelectVersion }) {
  return (
    <div className="page-content">
      <div className="page-intro">
        <span className="eyebrow">PROMPT ENGINEERING</span>
        <h2>Three steps toward a more helpful forecast.</h2>
        <p>Recorded versions build from a basic answer to location-aware context, then verified data and alert generation.</p>
      </div>
      <div className="version-timeline">
        {promptVersions.map((version, index) => (
          <article className={`version-card ${activeVersion === version.id ? "version-active" : ""}`} key={version.id}>
            <div className="version-card-top">
              <span className="version-number">{version.id}</span>
              <div className="version-title"><h3>{version.title}</h3><span>{index === 0 ? "Foundation" : `Improvement ${index}`}</span></div>
              <button className={activeVersion === version.id ? "button-active" : "button-secondary"} onClick={() => onSelectVersion(version.id)}>
                {activeVersion === version.id ? "Active" : "Use this version"}
              </button>
            </div>
            <p>{version.summary}</p>
            <details>
              <summary>View recorded prompt</summary>
              <blockquote>{version.prompt}</blockquote>
            </details>
            {index < promptVersions.length - 1 && <span className="version-connector" aria-hidden="true" />}
          </article>
        ))}
      </div>
      <div className="version-footnote"><strong>Active in chat: {activeVersion}</strong><span>Switching versions updates how the demo formats weather answers.</span></div>
    </div>
  );
}
