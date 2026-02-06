import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function generateZip(options) {
  const zip = new JSZip();

  if (options.vite) {
    zip.file("vite-react/.env.example", "VITE_PORT=5173\n");
    zip.file("vite-react/README.md", "# Vite + React Starter\n");
  }

  if (options.express) {
    zip.file("express/.env.example", "PORT=3000\n");
    zip.file("express/index.js", "console.log('Hello from Express');\n");
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "config-generator.zip");
}
