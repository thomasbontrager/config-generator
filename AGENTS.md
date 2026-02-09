# Agent Graph Documentation

## Overview

This document describes the agents (configuration generators) available in this project. Each agent is responsible for generating boilerplate configuration files for specific technology stacks.

## Agent Architecture

```
config-generator/
└── agents/
    ├── vite-react     (Frontend: React + Vite)
    └── express        (Backend: Node.js + Express)
```

Each agent owns its templates in `src/templates/{agent-name}/` and can be selected independently or in combination.

## Available Agents

### 1. Vite + React Agent

**Name:** `vite-react`  
**Purpose:** Generate production-ready Vite + React application configuration  
**Templates Location:** `src/templates/vite-react/`

**Generated Files:**
- `.env.example` - Environment variable template
- `Dockerfile` - Container configuration for production
- `docker-compose.yml` - Orchestration configuration
- `README.md` - Setup and usage instructions

**Use Case:** Frontend applications built with React and Vite bundler

**Key Features:**
- Modern React setup with Vite
- Docker support for containerization
- Environment configuration templates
- Development and production ready

---

### 2. Express Agent

**Name:** `express`  
**Purpose:** Generate minimal production-ready Express API server configuration  
**Templates Location:** `src/templates/express/`

**Generated Files:**
- `.env.example` - Environment variable template (PORT, etc.)
- `Dockerfile` - Container configuration for Node.js
- `docker-compose.yml` - Service orchestration
- `README.md` - API setup instructions

**Use Case:** Backend REST APIs or microservices with Express.js

**Key Features:**
- Lightweight Express server setup
- Docker containerization
- Environment-based configuration
- Production-ready defaults

---

## Agent Selection

### Web UI (Current)
Users can select agents via checkboxes in the web interface:
- Visit the web application
- Check desired agents (Vite + React, Express)
- Click "Generate ZIP" to download configurations

### CLI (Available)
Users can select agents via command-line interface:
```bash
# Generate all agents
npm run cli

# Generate specific agent(s)
npm run cli -- --agents=vite-react
npm run cli -- --agents=express
npm run cli -- --agents=vite-react,express
```

## Adding New Agents

To add a new agent:

1. **Create template folder:**
   ```
   src/templates/{agent-name}/
   ```

2. **Add template files:**
   - At minimum: `README.md`
   - Common: `.env.example`, `Dockerfile`, `docker-compose.yml`
   - Any other configuration files needed

3. **Update `generateZip.js`:**
   - Import template files
   - Add agent to zip generation logic

4. **Update `App.jsx`:**
   - Add checkbox for new agent
   - Add state management

5. **Update CLI:**
   - Add agent to available agents list
   - Ensure agent can be selected via CLI

6. **Update this document:**
   - Document the new agent's purpose
   - List generated files
   - Describe use cases

## Agent Graph Visualization

```
User Input
    │
    ├─→ Select: vite-react? ──→ [Vite+React Agent] ──→ Generate Frontend Config
    │                                                        │
    │                                                        ├─→ .env.example
    │                                                        ├─→ Dockerfile
    │                                                        ├─→ docker-compose.yml
    │                                                        └─→ README.md
    │
    └─→ Select: express? ──→ [Express Agent] ──→ Generate Backend Config
                                                     │
                                                     ├─→ .env.example
                                                     ├─→ Dockerfile
                                                     ├─→ docker-compose.yml
                                                     └─→ README.md
```

## Technical Details

### Template Loading
Templates are loaded using Vite's `?raw` import suffix, which imports files as raw strings:
```javascript
import templateFile from "./templates/{agent}/file.ext?raw";
```

### Zip Generation
The JSZip library is used to bundle selected templates into a downloadable ZIP file. Each agent's files are organized into separate folders within the ZIP.

### Agent Independence
Agents are designed to be independent and composable:
- Each agent can be used standalone
- Multiple agents can be selected together
- No dependencies between agents
- Each agent maintains its own template files

## Future Extensions

Potential new agents to consider:
- **Next.js Agent** - Full-stack React framework
- **FastAPI Agent** - Python API framework
- **Django Agent** - Python web framework  
- **PostgreSQL Agent** - Database configuration
- **Redis Agent** - Cache/queue configuration
- **Nginx Agent** - Reverse proxy configuration
- **GitHub Actions Agent** - CI/CD workflows
- **Terraform Agent** - Infrastructure as Code

Each new agent should follow the established pattern and maintain independence from other agents.
