import { useState } from "react";
import { generateZip } from "../generateZip";

export default function Generator() {
  const [vite, setVite] = useState(false);
  const [express, setExpress] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full rounded-xl p-8 border border-white/10" style={{ backgroundColor: '#121826' }}>
        <h1 className="text-4xl font-bold text-center mb-2">Config Generator</h1>
        <p className="text-center mb-8" style={{ color: '#9ca3af' }}>
          Select your stack and generate a production-ready ZIP
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#3b82f6' }}>
              Frontend
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={vite}
                onChange={(e) => setVite(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: '#3b82f6' }}
              />
              <span className="text-lg">Vite + React</span>
            </label>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#3b82f6' }}>
              Backend
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={express}
                onChange={(e) => setExpress(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: '#3b82f6' }}
              />
              <span className="text-lg">Express.js</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => generateZip({ vite, express })}
          disabled={!vite && !express}
          className="mt-8 w-full py-3 rounded font-medium text-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#3b82f6' }}
        >
          Generate ZIP
        </button>
      </div>
    </div>
  );
}
