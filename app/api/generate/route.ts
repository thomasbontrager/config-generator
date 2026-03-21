import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';
import { z } from 'zod';

// ─── Template registry ────────────────────────────────────────────────────────
// Each entry maps to the files that will be placed inside a same-named folder
// in the generated ZIP. All templates are self-contained; users are expected to
// copy the folder contents into their project root.

interface TemplateFiles {
  name: string;
  files: Record<string, string>;
}

const TEMPLATES: Record<string, TemplateFiles> = {
  'vite-react': {
    name: 'Vite + React',
    files: {
      '.env.example': [
        'VITE_APP_NAME=MyApp',
        'VITE_API_URL=http://localhost:3000',
      ].join('\n'),
      'Dockerfile': [
        'FROM node:20-alpine AS builder',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci',
        'COPY . .',
        'RUN npm run build',
        '',
        'FROM nginx:alpine',
        'COPY --from=builder /app/dist /usr/share/nginx/html',
        'EXPOSE 80',
        'CMD ["nginx", "-g", "daemon off;"]',
      ].join('\n'),
      'docker-compose.yml': [
        'services:',
        '  app:',
        '    build: .',
        '    ports:',
        '      - "80:80"',
        '    restart: unless-stopped',
      ].join('\n'),
      'README.md': [
        '# Vite + React',
        '',
        '## Development',
        '```bash',
        'npm install',
        'npm run dev',
        '```',
        '',
        '## Production build',
        '```bash',
        'npm run build',
        '```',
        '',
        '## Docker',
        '```bash',
        'docker-compose up --build',
        '```',
        '',
        '## Environment variables',
        'Copy `.env.example` → `.env` and fill in values.',
      ].join('\n'),
    },
  },

  'vue3': {
    name: 'Vue 3',
    files: {
      '.env.example': [
        'VITE_APP_NAME=MyApp',
        'VITE_API_URL=http://localhost:3000',
      ].join('\n'),
      'Dockerfile': [
        'FROM node:20-alpine AS builder',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci',
        'COPY . .',
        'RUN npm run build',
        '',
        'FROM nginx:alpine',
        'COPY --from=builder /app/dist /usr/share/nginx/html',
        'EXPOSE 80',
        'CMD ["nginx", "-g", "daemon off;"]',
      ].join('\n'),
      'docker-compose.yml': [
        'services:',
        '  app:',
        '    build: .',
        '    ports:',
        '      - "80:80"',
        '    restart: unless-stopped',
      ].join('\n'),
      'README.md': [
        '# Vue 3',
        '',
        '## Development',
        '```bash',
        'npm install',
        'npm run dev',
        '```',
        '',
        '## Production build',
        '```bash',
        'npm run build',
        '```',
        '',
        '## Docker',
        '```bash',
        'docker-compose up --build',
        '```',
      ].join('\n'),
    },
  },

  'next': {
    name: 'Next.js',
    files: {
      '.env.example': [
        'NEXTAUTH_URL=http://localhost:3000',
        'NEXTAUTH_SECRET=change-me',
        'DATABASE_URL=postgresql://user:password@localhost:5432/myapp',
      ].join('\n'),
      'Dockerfile': [
        'FROM node:20-alpine AS builder',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci',
        'COPY . .',
        'RUN npm run build',
        '',
        'FROM node:20-alpine',
        'WORKDIR /app',
        'ENV NODE_ENV=production',
        'COPY --from=builder /app/.next/standalone ./',
        'COPY --from=builder /app/.next/static ./.next/static',
        'COPY --from=builder /app/public ./public',
        'EXPOSE 3000',
        'CMD ["node", "server.js"]',
      ].join('\n'),
      'docker-compose.yml': [
        'services:',
        '  app:',
        '    build: .',
        '    ports:',
        '      - "3000:3000"',
        '    env_file: .env',
        '    restart: unless-stopped',
      ].join('\n'),
      'README.md': [
        '# Next.js',
        '',
        '## Development',
        '```bash',
        'npm install',
        'npm run dev',
        '```',
        '',
        '## Production',
        '```bash',
        'npm run build && npm start',
        '```',
        '',
        '## Docker',
        '```bash',
        '# Enable standalone output in next.config.js first:',
        '# output: "standalone"',
        'docker-compose up --build',
        '```',
      ].join('\n'),
    },
  },

  'express': {
    name: 'Express.js',
    files: {
      '.env.example': [
        'PORT=3000',
        'NODE_ENV=development',
        'DATABASE_URL=postgresql://user:password@localhost:5432/myapp',
        'JWT_SECRET=change-me',
      ].join('\n'),
      'server.js': [
        "'use strict';",
        "require('dotenv').config();",
        "const express = require('express');",
        '',
        'const app = express();',
        'const PORT = process.env.PORT || 3000;',
        '',
        'app.use(express.json());',
        "app.use(express.urlencoded({ extended: true }));",
        '',
        "app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));",
        '',
        'app.listen(PORT, () => {',
        "  console.log(`Server listening on port ${PORT}`);",
        '});',
        '',
        'module.exports = app;',
      ].join('\n'),
      'Dockerfile': [
        'FROM node:20-alpine',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci --omit=dev',
        'COPY . .',
        'EXPOSE 3000',
        'CMD ["node", "server.js"]',
      ].join('\n'),
      'docker-compose.yml': [
        'services:',
        '  api:',
        '    build: .',
        '    ports:',
        '      - "3000:3000"',
        '    env_file: .env',
        '    restart: unless-stopped',
      ].join('\n'),
      'README.md': [
        '# Express.js API',
        '',
        '## Installation',
        '```bash',
        'npm install',
        'node server.js',
        '```',
        '',
        '## Docker',
        '```bash',
        'docker-compose up --build',
        '```',
        '',
        '## Environment variables',
        'Copy `.env.example` → `.env` and fill in values.',
      ].join('\n'),
    },
  },

  'django': {
    name: 'Django',
    files: {
      '.env.example': [
        'DEBUG=False',
        'SECRET_KEY=change-me',
        'ALLOWED_HOSTS=localhost,127.0.0.1',
        'DATABASE_URL=postgresql://user:password@localhost:5432/myapp',
      ].join('\n'),
      'Dockerfile': [
        'FROM python:3.12-slim',
        'WORKDIR /app',
        'ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1',
        'COPY requirements.txt .',
        'RUN pip install --no-cache-dir -r requirements.txt',
        'COPY . .',
        'EXPOSE 8000',
        'CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]',
      ].join('\n'),
      'docker-compose.yml': [
        'services:',
        '  web:',
        '    build: .',
        '    ports:',
        '      - "8000:8000"',
        '    env_file: .env',
        '    restart: unless-stopped',
      ].join('\n'),
      'README.md': [
        '# Django',
        '',
        '## Setup',
        '```bash',
        'python -m venv venv && source venv/bin/activate',
        'pip install -r requirements.txt',
        'python manage.py migrate',
        'python manage.py runserver',
        '```',
        '',
        '## Docker',
        '```bash',
        'docker-compose up --build',
        '```',
      ].join('\n'),
    },
  },

  'docker': {
    name: 'Docker',
    files: {
      'Dockerfile': [
        '# Replace this with your app-specific base image and build steps.',
        'FROM node:20-alpine',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci --omit=dev',
        'COPY . .',
        'EXPOSE 3000',
        'CMD ["node", "index.js"]',
      ].join('\n'),
      'docker-compose.yml': [
        'services:',
        '  app:',
        '    build: .',
        '    ports:',
        '      - "3000:3000"',
        '    env_file: .env',
        '    restart: unless-stopped',
        '',
        '  # Uncomment for a local Postgres database:',
        '  # db:',
        '#   image: postgres:16-alpine',
        '#   environment:',
        '#     POSTGRES_USER: appuser',
        '#     POSTGRES_PASSWORD: secret',
        '#     POSTGRES_DB: appdb',
        '#   volumes:',
        '#     - pg_data:/var/lib/postgresql/data',
        '',
        '# volumes:',
        '#   pg_data:',
      ].join('\n'),
      '.dockerignore': [
        'node_modules',
        'npm-debug.log',
        '.env',
        '.git',
        '.next',
        'dist',
        'build',
      ].join('\n'),
      'README.md': [
        '# Docker',
        '',
        '## Build and run',
        '```bash',
        'docker-compose up --build',
        '```',
        '',
        '## Build image only',
        '```bash',
        'docker build -t myapp .',
        'docker run -p 3000:3000 myapp',
        '```',
      ].join('\n'),
    },
  },

  'k8s': {
    name: 'Kubernetes',
    files: {
      'deployment.yaml': [
        'apiVersion: apps/v1',
        'kind: Deployment',
        'metadata:',
        '  name: myapp',
        '  labels:',
        '    app: myapp',
        'spec:',
        '  replicas: 2',
        '  selector:',
        '    matchLabels:',
        '      app: myapp',
        '  template:',
        '    metadata:',
        '      labels:',
        '        app: myapp',
        '    spec:',
        '      containers:',
        '        - name: myapp',
        '          image: myapp:latest',
        '          ports:',
        '            - containerPort: 3000',
        '          envFrom:',
        '            - secretRef:',
        '                name: myapp-secrets',
        '          resources:',
        '            requests:',
        '              cpu: "100m"',
        '              memory: "128Mi"',
        '            limits:',
        '              cpu: "500m"',
        '              memory: "512Mi"',
      ].join('\n'),
      'service.yaml': [
        'apiVersion: v1',
        'kind: Service',
        'metadata:',
        '  name: myapp',
        'spec:',
        '  selector:',
        '    app: myapp',
        '  ports:',
        '    - port: 80',
        '      targetPort: 3000',
        '  type: ClusterIP',
      ].join('\n'),
      'ingress.yaml': [
        'apiVersion: networking.k8s.io/v1',
        'kind: Ingress',
        'metadata:',
        '  name: myapp',
        '  annotations:',
        '    nginx.ingress.kubernetes.io/rewrite-target: /',
        'spec:',
        '  rules:',
        '    - host: myapp.example.com',
        '      http:',
        '        paths:',
        '          - path: /',
        '            pathType: Prefix',
        '            backend:',
        '              service:',
        '                name: myapp',
        '                port:',
        '                  number: 80',
      ].join('\n'),
      'README.md': [
        '# Kubernetes',
        '',
        '## Deploy',
        '```bash',
        'kubectl apply -f deployment.yaml',
        'kubectl apply -f service.yaml',
        'kubectl apply -f ingress.yaml',
        '```',
        '',
        '## Scale',
        '```bash',
        'kubectl scale deployment myapp --replicas=3',
        '```',
        '',
        '## Logs',
        '```bash',
        'kubectl logs -l app=myapp -f',
        '```',
      ].join('\n'),
    },
  },

  'github-actions': {
    name: 'GitHub Actions',
    files: {
      '.github/workflows/ci.yml': [
        'name: CI',
        '',
        'on:',
        '  push:',
        '    branches: [main]',
        '  pull_request:',
        '    branches: [main]',
        '',
        'jobs:',
        '  test:',
        '    runs-on: ubuntu-latest',
        '    steps:',
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-node@v4',
        '        with:',
        '          node-version: "20"',
        '          cache: npm',
        '      - run: npm ci',
        '      - run: npm test',
        '      - run: npm run build',
      ].join('\n'),
      '.github/workflows/deploy.yml': [
        'name: Deploy',
        '',
        'on:',
        '  push:',
        '    branches: [main]',
        '',
        'jobs:',
        '  deploy:',
        '    runs-on: ubuntu-latest',
        '    needs: []   # add test job here when ready',
        '    steps:',
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-node@v4',
        '        with:',
        '          node-version: "20"',
        '          cache: npm',
        '      - run: npm ci',
        '      - run: npm run build',
        '      # Add your deployment step here',
        '      # e.g. SSH deploy, Vercel, Railway, Docker push, etc.',
      ].join('\n'),
      'README.md': [
        '# GitHub Actions',
        '',
        '## Included workflows',
        '',
        '### ci.yml',
        'Runs on every push and PR to `main`.',
        '- Installs deps',
        '- Runs tests',
        '- Builds the project',
        '',
        '### deploy.yml',
        'Runs on push to `main`. Add your deployment step at the bottom.',
        '',
        '## Required secrets',
        'Set these in your repository Settings → Secrets → Actions:',
        '',
        '| Secret | Description |',
        '|--------|-------------|',
        '| _(none by default — add as needed)_ | |',
      ].join('\n'),
    },
  },
};

// ─── Input schema ─────────────────────────────────────────────────────────────

const VALID_CONFIG_TYPES = Object.keys(TEMPLATES);

const requestSchema = z.object({
  configTypes: z
    .array(z.enum(VALID_CONFIG_TYPES as [string, ...string[]]))
    .min(1, 'Select at least one config type')
    .max(VALID_CONFIG_TYPES.length),
});

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let configTypes: string[];

    try {
      const body = await request.json();
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
          { status: 400 }
        );
      }
      configTypes = parsed.data.configTypes;
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Enforce trial generation limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionStatus: true,
        _count: { select: { generatedConfigs: true } },
      },
    });

    if (user?.subscriptionStatus === 'TRIAL' && (user._count.generatedConfigs ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'Trial limit reached. Please upgrade to Pro.' },
        { status: 403 }
      );
    }

    // Build ZIP
    const zip = new JSZip();

    for (const configType of configTypes) {
      const template = TEMPLATES[configType];
      // requestSchema already validates that configType is a known key
      if (!template) continue;

      const folder = zip.folder(configType);
      if (!folder) continue;

      for (const [filePath, content] of Object.entries(template.files)) {
        // Support nested paths (e.g. ".github/workflows/ci.yml")
        folder.file(filePath, content);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Persist record for history
    const configName = configTypes
      .map((t) => TEMPLATES[t]?.name ?? t)
      .join(', ');

    await prisma.generatedConfig.create({
      data: {
        userId: session.user.id,
        name: configName,
        configType: configTypes.join(', '),
        content: { configTypes },
      },
    });

    return new NextResponse(new Blob([zipBuffer.buffer as ArrayBuffer], { type: 'application/zip' }), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="shipforge-${configTypes.join('-')}-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
