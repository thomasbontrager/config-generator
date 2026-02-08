import { useState } from "react";
import { generateZip } from "./generateZip";
import "./App.css";

export default function App() {
  const [vite, setVite] = useState(false);
  const [express, setExpress] = useState(false);
  const [nextjs, setNextjs] = useState(false);
  const [githubRulesets, setGithubRulesets] = useState(false);

  return (
    <div
      style={{
        padding: 32,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        background: "#1e1e1e",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1>Config / Boilerplate Generator</h1>
      <p>Select your stack and generate a ZIP.</p>

      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={vite}
            onChange={(e) => setVite(e.target.checked)}
          />{" "}
          Vite + React
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={express}
            onChange={(e) => setExpress(e.target.checked)}
          />{" "}
          Express
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={nextjs}
            onChange={(e) => setNextjs(e.target.checked)}
          />{" "}
          Next.js
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={githubRulesets}
            onChange={(e) => setGithubRulesets(e.target.checked)}
          />{" "}
          GitHub Branch Protection Rulesets
        </label>
      </div>

      <button
        style={{
          marginTop: 20,
          padding: "10px 18px",
          fontSize: 16,
          cursor: "pointer",
        }}
        onClick={() => generateZip({ vite, express, nextjs, githubRulesets })}
        disabled={!vite && !express && !nextjs && !githubRulesets}
      >
        Generate ZIP
      </button>
    </div>
  );
}
