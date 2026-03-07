# Config / Boilerplate Generator

A production-ready Next.js 15 SaaS application for generating configuration files and boilerplates for various tech stacks.

## Features

- 🚀 **Vite + React** - Production-ready frontend setup
- 🔧 **Express** - Minimal backend API server
- 📦 **Multiple output formats** - Web UI, CLI, or ZIP download
- 🎯 **Docker ready** - All templates include Docker configurations
- 📝 **Environment configs** - Pre-configured .env examples

## Quick Start

### Web UI

1. Install dependencies:
```bash
npm install
```

2. Start the dev server:
```bash
npm run dev
```

3. Open your browser and select the configurations you want to generate.

### CLI

Generate configs directly from the command line:

```bash
# List available agents
npm run cli -- --list

# Generate specific agent configs
npm run cli -- --agents=vite-react
npm run cli -- --agents=express
npm run cli -- --agents=vite-react,express

# Generate to custom directory
npm run cli -- --agents=vite-react,express --output=./my-configs

# Generate ZIP file
npm run cli -- --agents=vite-react,express --output=./config.zip --zip

# Show help
npm run cli -- --help
```

## Available Agents

- **vite-react** - Production-ready Vite + React starter
- **express** - Minimal production-ready Express server starter

See [AGENTS.md](./AGENTS.md) for detailed documentation on each agent.

## Project Structure

```
config-generator/
├── src/
│   ├── templates/          # Template files for each agent
│   │   ├── vite-react/     # Vite + React templates
│   │   └── express/        # Express templates
│   ├── App.jsx             # Web UI
│   └── generateZip.js      # ZIP generation logic
├── cli.js                  # CLI interface
├── AGENTS.md              # Agent documentation
└── README.md              # This file
```

## Build for Production

```bash
npm run build
```

## Deploy

```bash
npm run deploy
```

## Adding New Agents

See [AGENTS.md](./AGENTS.md) for instructions on adding new configuration agents.

