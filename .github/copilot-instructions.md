# Copilot Instructions

## Tech stack
- Language: JavaScript (ES6+)
- Framework: React 19
- Build Tool: Vite 7
- Package Manager: npm
- Deployment: GitHub Pages
- Additional Libraries: JSZip (for ZIP generation), file-saver

## Project purpose
This is a web-based config/boilerplate generator that allows users to select tech stacks (Vite+React, Express) and download a ZIP file containing configuration files, Dockerfiles, and setup instructions for their selected stack.

## Code style
- Use functional React components with hooks
- Use default exports for main component files (App.jsx follows this pattern)
- ES6+ features: arrow functions, destructuring, template literals
- Inline styles are acceptable for this project (currently used throughout)
- Keep components simple and focused
- Use clear, descriptive variable names

## Project structure
- `/src` - React application source code
  - `App.jsx` - Main application component
  - `main.jsx` - React entry point
  - `generateZip.js` - Core logic for creating ZIP files
  - `/templates` - Template files for different tech stacks (imported as raw strings)
  - `/assets` - Static assets like images
- `/public` - Static files served directly
- `/docs` - Additional documentation
- Root HTML files (`index.html`, `contact.html`, etc.) - Static landing pages
- `.github/workflows` - CI/CD configuration for GitHub Pages deployment

## Build and deployment
- Development: `npm run dev` (starts Vite dev server)
- Build: `npm run build` (outputs to `/dist`)
- Deploy: Automatic via GitHub Actions on push to main branch
- ESLint is configured but there are no tests currently

## Linting
- ESLint with React Hooks and React Refresh plugins
- Config file: `eslint.config.js` (flat config format)
- Unused variables are allowed if they start with uppercase or underscore
- Run: `npx eslint .`

## Testing
- No testing framework is currently configured
- When adding tests in the future, consider Jest + React Testing Library

## Conventions
- No TypeScript - this is a JavaScript-only project
- Template files are imported as raw strings using Vite's `?raw` suffix
- Keep the project lightweight and focused on its core purpose
- Deployment target is GitHub Pages (static site)

## Important constraints
- This is a frontend-only application
- No backend server or API
- All template generation happens client-side using JSZip
- Must work as a static site deployed to GitHub Pages
- Domain: shipforge.dev
