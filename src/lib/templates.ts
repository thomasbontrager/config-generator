// Template definitions for config generation

export const templates = {
  react: {
    'package.json': JSON.stringify({
      name: 'react-app',
      version: '0.1.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^5.0.0',
        vite: '^5.0.0'
      }
    }, null, 2),
    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})`,
    '.env.example': `VITE_API_URL=http://localhost:8000
VITE_APP_NAME=MyApp`,
    'Dockerfile': `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]`,
    'README.md': `# React + Vite App

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build for Production

\`\`\`bash
npm run build
\`\`\`
`
  },
  
  vue: {
    'package.json': JSON.stringify({
      name: 'vue-app',
      version: '0.1.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        vue: '^3.4.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.0.0',
        vite: '^5.0.0'
      }
    }, null, 2),
    'vite.config.js': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  }
})`,
    '.env.example': `VITE_API_URL=http://localhost:8000
VITE_APP_NAME=MyVueApp`,
    'Dockerfile': `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]`,
    'README.md': `# Vue 3 + Vite App

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build for Production

\`\`\`bash
npm run build
\`\`\`
`
  },

  express: {
    'package.json': JSON.stringify({
      name: 'express-api',
      version: '1.0.0',
      scripts: {
        dev: 'nodemon server.js',
        start: 'node server.js'
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        dotenv: '^16.3.1'
      },
      devDependencies: {
        nodemon: '^3.0.1'
      }
    }, null, 2),
    'server.js': `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    '.env.example': `PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dbname`,
    'Dockerfile': `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]`,
    'README.md': `# Express API

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Production

\`\`\`bash
npm start
\`\`\`
`
  },

  django: {
    'requirements.txt': `Django==4.2.0
djangorestframework==3.14.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9`,
    'manage.py': `#!/usr/bin/env python
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)`,
    '.env.example': `DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1`,
    'Dockerfile': `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]`,
    'README.md': `# Django API

## Getting Started

\`\`\`bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
\`\`\`
`
  },

  docker: {
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`,
    'README.md': `# Docker Configuration

## Usage

\`\`\`bash
docker-compose up -d
\`\`\`

## Stop

\`\`\`bash
docker-compose down
\`\`\`
`
  },

  kubernetes: {
    'deployment.yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"`,
    'service.yaml': `apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer`,
    'README.md': `# Kubernetes Configuration

## Deploy

\`\`\`bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
\`\`\`

## Check Status

\`\`\`bash
kubectl get pods
kubectl get services
\`\`\`
`
  },

  'github-actions': {
    '.github/workflows/ci.yml': `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Production
      if: github.ref == 'refs/heads/main'
      run: echo "Deploy to production"
      # Add your deployment commands here`,
    'README.md': `# GitHub Actions CI/CD

## Features

- Automated testing on push
- Build verification
- Deployment to production on main branch merge

## Usage

The workflow runs automatically on push to main or develop branches.
`
  }
}

export type ConfigType = keyof typeof templates
