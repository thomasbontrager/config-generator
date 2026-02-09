import JSZip from "jszip";
import { saveAs } from "file-saver";

// Vite + React templates
import viteEnv from "./templates/vite-react/.env.example?raw";
import viteDockerfile from "./templates/vite-react/Dockerfile?raw";
import viteCompose from "./templates/vite-react/docker-compose.yml?raw";
import viteReadme from "./templates/vite-react/README.md?raw";

// Express templates
import expressEnv from "./templates/express/.env.example?raw";
import expressDockerfile from "./templates/express/Dockerfile?raw";
import expressCompose from "./templates/express/docker-compose.yml?raw";
import expressReadme from "./templates/express/README.md?raw";
import expressPM2 from "./templates/express/ecosystem.config.js?raw";
import expressNginx from "./templates/express/nginx.conf?raw";

export async function generateZip({ vite, express }) {
  const zip = new JSZip();

  if (vite) {
    const viteFolder = zip.folder("vite-react");

    viteFolder.file(".env.example", viteEnv);
    viteFolder.file("Dockerfile", viteDockerfile);
    viteFolder.file("docker-compose.yml", viteCompose);
    viteFolder.file("README.md", viteReadme);
  }

  if (express) {
    const expressFolder = zip.folder("express");

    expressFolder.file(".env.example", expressEnv);
    expressFolder.file("Dockerfile", expressDockerfile);
    expressFolder.file("docker-compose.yml", expressCompose);
    expressFolder.file("README.md", expressReadme);
    expressFolder.file("ecosystem.config.js", expressPM2);
    expressFolder.file("nginx.conf", expressNginx);
  }

  if (!vite && !express) {
    alert("Please select at least one stack.");
    return;
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "config-generator.zip");
}
