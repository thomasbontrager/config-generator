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

// GitHub Rulesets templates
import githubRulesetJson from "./templates/github-rulesets/branch-protection-ruleset.json?raw";
import githubRulesetReadme from "./templates/github-rulesets/README.md?raw";

export async function generateZip({ vite, express, githubRulesets }) {
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
  }

  if (githubRulesets) {
    const githubFolder = zip.folder("github-rulesets");

    githubFolder.file("branch-protection-ruleset.json", githubRulesetJson);
    githubFolder.file("README.md", githubRulesetReadme);
  }

  if (!vite && !express && !githubRulesets) {
    alert("Please select at least one stack.");
    return;
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "config-generator.zip");
}
