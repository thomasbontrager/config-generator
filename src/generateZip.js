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

// Express Backend (PostgreSQL + Prisma) templates
import backendGitignore from "./templates/express/backend/.gitignore?raw";
import backendEnv from "./templates/express/backend/.env.example?raw";
import backendPackage from "./templates/express/backend/package.json?raw";
import backendReadme from "./templates/express/backend/README.md?raw";
import backendIndex from "./templates/express/backend/src/index.js?raw";
import backendPrismaSchema from "./templates/express/backend/prisma/schema.prisma?raw";
import backendPrismaUtil from "./templates/express/backend/src/utils/prisma.js?raw";
import backendJwtUtil from "./templates/express/backend/src/utils/jwt.js?raw";
import backendAuthController from "./templates/express/backend/src/controllers/auth.controller.js?raw";
import backendAuthMiddleware from "./templates/express/backend/src/middleware/auth.middleware.js?raw";
import backendAuthRoutes from "./templates/express/backend/src/routes/auth.routes.js?raw";

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

    // Add backend subfolder with complete PostgreSQL + Prisma setup
    const backendFolder = expressFolder.folder("backend");
    
    backendFolder.file(".gitignore", backendGitignore);
    backendFolder.file(".env.example", backendEnv);
    backendFolder.file("package.json", backendPackage);
    backendFolder.file("README.md", backendReadme);
    
    // Prisma
    const prismaFolder = backendFolder.folder("prisma");
    prismaFolder.file("schema.prisma", backendPrismaSchema);
    
    // Source files
    const srcFolder = backendFolder.folder("src");
    srcFolder.file("index.js", backendIndex);
    
    // Controllers
    const controllersFolder = srcFolder.folder("controllers");
    controllersFolder.file("auth.controller.js", backendAuthController);
    
    // Middleware
    const middlewareFolder = srcFolder.folder("middleware");
    middlewareFolder.file("auth.middleware.js", backendAuthMiddleware);
    
    // Routes
    const routesFolder = srcFolder.folder("routes");
    routesFolder.file("auth.routes.js", backendAuthRoutes);
    
    // Utils
    const utilsFolder = srcFolder.folder("utils");
    utilsFolder.file("prisma.js", backendPrismaUtil);
    utilsFolder.file("jwt.js", backendJwtUtil);
  }

  if (!vite && !express) {
    alert("Please select at least one stack.");
    return;
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "config-generator.zip");
}
