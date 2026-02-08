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
import expressPackageJson from "./templates/express/package.json?raw";
import expressAppJs from "./templates/express/app.js?raw";

// Express PayPal integration files
import expressPaypalUtil from "./templates/express/src/utils/paypal.js?raw";
import expressBillingController from "./templates/express/src/controllers/billing.controller.js?raw";
import expressBillingRoutes from "./templates/express/src/routes/billing.routes.js?raw";
import expressWebhookRoutes from "./templates/express/src/routes/webhook.routes.js?raw";
import expressAuthMiddleware from "./templates/express/src/middleware/auth.middleware.js?raw";

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
    expressFolder.file("package.json", expressPackageJson);
    expressFolder.file("app.js", expressAppJs);

    // PayPal integration files
    expressFolder.file("src/utils/paypal.js", expressPaypalUtil);
    expressFolder.file("src/controllers/billing.controller.js", expressBillingController);
    expressFolder.file("src/routes/billing.routes.js", expressBillingRoutes);
    expressFolder.file("src/routes/webhook.routes.js", expressWebhookRoutes);
    expressFolder.file("src/middleware/auth.middleware.js", expressAuthMiddleware);
  }

  if (!vite && !express) {
    alert("Please select at least one stack.");
    return;
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "config-generator.zip");
}

