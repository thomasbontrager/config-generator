import JSZip from "jszip";
import { saveAs } from "file-saver";

// Vite + React templates
import viteEnv from "./templates/vite-react/.env.example?raw";
import viteDockerfile from "./templates/vite-react/Dockerfile?raw";
import viteCompose from "./templates/vite-react/docker-compose.yml?raw";
import viteReadme from "./templates/vite-react/README.md?raw";

// Express templates
import expressEnv from "./templates/express/.env.example?raw";
import expressGitignore from "./templates/express/.gitignore?raw";
import expressDockerfile from "./templates/express/Dockerfile?raw";
import expressCompose from "./templates/express/docker-compose.yml?raw";
import expressReadme from "./templates/express/README.md?raw";
import expressSecurityTesting from "./templates/express/SECURITY_TESTING.md?raw";
import expressPackage from "./templates/express/package.json?raw";
import expressSchema from "./templates/express/prisma/schema.prisma?raw";
import expressApp from "./templates/express/src/app.js?raw";
import expressAuthMiddleware from "./templates/express/src/middleware/auth.js?raw";
import expressRateLimitMiddleware from "./templates/express/src/middleware/rateLimit.js?raw";
import expressApiRoutes from "./templates/express/src/routes/api.routes.js?raw";
import expressAuthRoutes from "./templates/express/src/routes/auth.routes.js?raw";
import expressWebhookRoutes from "./templates/express/src/routes/webhook.routes.js?raw";
import expressPaypalVerify from "./templates/express/src/utils/paypalVerify.js?raw";
import expressPrisma from "./templates/express/src/utils/prisma.js?raw";

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
    expressFolder.file(".gitignore", expressGitignore);
    expressFolder.file("Dockerfile", expressDockerfile);
    expressFolder.file("docker-compose.yml", expressCompose);
    expressFolder.file("README.md", expressReadme);
    expressFolder.file("SECURITY_TESTING.md", expressSecurityTesting);
    expressFolder.file("package.json", expressPackage);
    
    // Prisma
    expressFolder.file("prisma/schema.prisma", expressSchema);
    
    // Source files
    expressFolder.file("src/app.js", expressApp);
    
    // Middleware
    expressFolder.file("src/middleware/auth.js", expressAuthMiddleware);
    expressFolder.file("src/middleware/rateLimit.js", expressRateLimitMiddleware);
    
    // Routes
    expressFolder.file("src/routes/api.routes.js", expressApiRoutes);
    expressFolder.file("src/routes/auth.routes.js", expressAuthRoutes);
    expressFolder.file("src/routes/webhook.routes.js", expressWebhookRoutes);
    
    // Utils
    expressFolder.file("src/utils/paypalVerify.js", expressPaypalVerify);
    expressFolder.file("src/utils/prisma.js", expressPrisma);
  }

  if (!vite && !express) {
    alert("Please select at least one stack.");
    return;
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "config-generator.zip");
}
