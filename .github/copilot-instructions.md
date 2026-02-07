# Project Overview
This is a Config/Boilerplate Generator web application built with React and Vite. The application allows users to select different technology stacks (Vite + React, Express) and generates a downloadable ZIP file containing the appropriate configuration files and boilerplate code.

# Tech Stack
- React 19.2.0
- Vite 7.2.4 (build tool and dev server)
- JavaScript (ES2020+)
- JSZip for generating ZIP files
- FileSaver for downloading files
- ESLint for code quality
- gh-pages for deployment

# Coding Standards
- Use functional components and React Hooks (no class components)
- Use ES6+ JavaScript syntax (arrow functions, destructuring, etc.)
- Follow ESLint recommended rules (configured in `eslint.config.js`)
- Unused variables are allowed if they match pattern `^[A-Z_]` (uppercase or underscore prefix)
- Use JSX for React components
- ECMAScript version: 2020 with latest features
- Source type: ES modules (type: "module" in package.json)

# Code Style
- Use double quotes for strings
- Inline styles are acceptable for simple component styling
- CSS modules via separate `.css` files (App.css, index.css)
- Component file naming: PascalCase with `.jsx` extension (e.g., `App.jsx`)
- Utility/helper files: camelCase with `.js` extension (e.g., `generateZip.js`)

# Project Structure
```
/src
  - App.jsx           # Main application component
  - main.jsx          # React app entry point
  - generateZip.js    # Utility for generating ZIP files
  - templates/        # Configuration templates for different stacks
  - assets/           # Static assets
```

# Development Workflow
- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Deploy to GitHub Pages: `npm run deploy`
- Lint code: ESLint is configured but run via `eslint` command

# Best Practices
- Keep components simple and focused
- Extract reusable logic into utility functions
- Use template files in `src/templates/` for configuration generation
- Maintain clean separation between UI components and utility logic
- All generated files should be properly formatted and follow best practices for their respective technologies

# Dependencies Management
- Use npm for package management
- Lock versions in package-lock.json
- Keep dependencies up to date but test thoroughly
- Production dependencies: react, react-dom, file-saver, jszip
- Development dependencies: vite, eslint, gh-pages, type definitions

# Deployment
- The app is deployed to GitHub Pages
- Custom domain configured via CNAME file
- Build output goes to `dist/` directory (ignored in git)
- Base path is "/" for custom domain (shipforge.dev)
