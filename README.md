# ⚡ ShipForge Config Generator

A web-based tool that generates ready-to-use configuration files and boilerplate code for popular tech stacks. Select your stack, download a ZIP file, and start building immediately.

🌐 **Live Demo:** [shipforge.dev](https://shipforge.dev)

## 🚀 Features

- **Zero Configuration Required** - Select your tech stack and get production-ready configs instantly
- **Multiple Stack Support** - Generate configs for frontend and backend frameworks
- **Docker Ready** - Includes Dockerfiles and docker-compose configurations
- **Environment Templates** - Pre-configured `.env.example` files for each stack
- **Download as ZIP** - Get all files in a convenient ZIP archive

## 🛠️ Supported Stacks

### Frontend
- **Vite + React** - Modern React development with Vite build tool
  - Environment configuration (.env.example)
  - Docker setup (Dockerfile, docker-compose.yml)
  - README with setup instructions

### Backend
- **Express.js** - Minimal Node.js web framework
  - Environment configuration (.env.example)
  - Docker setup (Dockerfile, docker-compose.yml)
  - README with setup instructions

## 📦 What You Get

When you select a stack and generate a ZIP, you'll receive:

```
config-generator.zip
├── vite-react/              (if Vite + React selected)
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
└── express/                 (if Express selected)
    ├── .env.example
    ├── Dockerfile
    ├── docker-compose.yml
    └── README.md
```

## 🏃 Quick Start

### Using the Web App

1. Visit [shipforge.dev](https://shipforge.dev)
2. Select your desired tech stacks (Frontend and/or Backend)
3. Click "Generate ZIP"
4. Extract the downloaded ZIP file
5. Follow the README in each folder to get started

### Local Development

Clone and run the generator locally:

```bash
# Clone the repository
git clone https://github.com/thomasbontrager/config-generator.git
cd config-generator

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔨 Development

### Built With

- **React** - UI framework
- **Vite** - Build tool and dev server
- **JSZip** - ZIP file generation
- **FileSaver.js** - File download handling

### Project Structure

```
config-generator/
├── src/
│   ├── App.jsx              # Main React component
│   ├── generateZip.js       # ZIP generation logic
│   └── templates/           # Template files for each stack
│       ├── vite-react/
│       └── express/
├── public/                  # Static assets
├── index.html               # Main HTML landing page
├── dashboard.html           # Dashboard page
├── todo.html                # Task management page
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages

## 🚢 Deployment

The project is configured to deploy to GitHub Pages automatically on push to the `main` branch.

### Manual Deployment

```bash
npm run build
npm run deploy
```

## 🌐 Additional Pages

- **Pricing** (`/pricing.html`) - Subscription plans
- **Contact** (`/contact.html`) - Contact form
- **Dashboard** (`/dashboard.html`) - User dashboard
- **Todo** (`/todo.html`) - Task management

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/thomasbontrager/config-generator/issues).

## 👤 Author

**Thomas Bontrager**

- GitHub: [@thomasbontrager](https://github.com/thomasbontrager)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
