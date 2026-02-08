# Config / Boilerplate Generator

## What is this?

A lightweight web application that generates configuration files and boilerplate code for popular tech stacks. Users select their desired technologies (Vite+React, Express, etc.) and instantly download a ZIP containing Dockerfiles, docker-compose configurations, environment templates, and setup instructions.

**Live at:** [shipforge.dev](https://shipforge.dev)

## Who is this for?

- Developers who want to quickly bootstrap new projects
- Teams standardizing their tech stack setup
- Anyone tired of copying config files between projects
- Learners who want to see best-practice configurations

## What "good" looks like

A successful implementation should:
- Generate valid, working configurations that can be used immediately
- Be fast and intuitive - select stacks, click generate, get files
- Require zero backend infrastructure (fully client-side)
- Work reliably as a static site on GitHub Pages
- Be easily extensible to add new tech stacks

## Key constraints

- **Frontend-only**: This is a static web app with no backend/API
- **Client-side ZIP generation**: All file bundling happens in the browser using JSZip
- **Template-based**: New stacks are added by creating template files in `/src/templates`
- **GitHub Pages**: Must remain deployable as a static site

## Tech stack

- **React 19** with functional components and hooks
- **Vite 7** for fast development and optimized builds
- **JSZip** for creating ZIP archives in the browser
- **file-saver** for triggering downloads
- **ESLint** for code quality

## Getting started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy (requires gh-pages setup)
npm run deploy
```

## Project structure

```
├── src/
│   ├── App.jsx              # Main application component
│   ├── generateZip.js       # Core ZIP generation logic
│   └── templates/           # Config templates for each stack
├── index.html               # Main landing page
├── contact.html             # Contact page
├── pricing.html             # Pricing information
└── .github/workflows/       # Automated deployment
```

## Adding a new tech stack

1. Create a new folder in `src/templates/your-stack/`
2. Add template files (Dockerfile, .env.example, README.md, etc.)
3. Import templates in `src/generateZip.js` as raw strings
4. Update the UI in `src/App.jsx` to include the new option
5. Add corresponding logic in `generateZip()` function

## Contributing

Contributions are welcome! When adding new features:
- Keep it simple and lightweight
- Ensure templates are production-ready
- Test that generated ZIPs work as expected
- Follow existing code style and patterns

## License

This project is open source and available under the MIT License.
