import { useState } from "react";
import { generateZip } from "./generateZip";

export default function App() {
  const [vite, setVite] = useState(false);
  const [express, setExpress] = useState(false);

  return (
    <div style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Config / Boilerplate Generator</h1>
      <p>Select your stack and generate a ZIP.</p>

      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={vite}
            onChange={(e) => setVite(e.target.checked)}
          />
          {" "}Vite + React
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={express}
            onChange={(e) => setExpress(e.target.checked)}
          />
          {" "}Express
        </label>
      </div>

      <button
        style={{ marginTop: 20, padding: "8px 16px" }}
        onClick={() => generateZip({ vite, express })}
      >
        Generate ZIP
      </button>
    </div>
  );
}
