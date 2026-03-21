/**
 * lib/generator.ts
 * Shared template registry and ZIP-building logic.
 * Used by /api/generate and /api/stacks/[id]/generate.
 */
import JSZip from 'jszip';
import type { StackConfig } from '@/types/stack-config';

// ─── Template registry ────────────────────────────────────────────────────────

export interface TemplateFiles {
  name: string;
  files: Record<string, string>;
}

export const TEMPLATES: Record<string, TemplateFiles> = {
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

export const VALID_CONFIG_TYPES = Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>;

/**
 * Builds a ZIP archive containing the requested config type templates.
 * Returns a Node.js Buffer suitable for streaming as a response.
 */
export async function buildZip(configTypes: string[]): Promise<Buffer> {
  const zip = new JSZip();

  for (const configType of configTypes) {
    const template = TEMPLATES[configType];
    if (!template) continue;

    const folder = zip.folder(configType);
    if (!folder) continue;

    for (const [filePath, content] of Object.entries(template.files)) {
      folder.file(filePath, content);
    }
  }

  return zip.generateAsync({ type: 'nodebuffer' });
}

/**
 * Returns a human-readable name for a set of config types.
 * e.g. ["vite-react", "express"] → "Vite + React, Express.js"
 */
export function configTypesLabel(configTypes: string[]): string {
  return configTypes.map((t) => TEMPLATES[t]?.name ?? t).join(', ');
}

// ─── Normalized StackConfig → ZIP ────────────────────────────────────────────

/**
 * Builds a ZIP archive from a normalized StackConfig.
 * Files are organised under a top-level folder named after the project slug.
 */
export async function buildZipFromConfig(config: StackConfig): Promise<Buffer> {
  const zip = new JSZip();
  const root = zip.folder(config.slug) ?? zip;

  // ── .env.example ───────────────────────────────────────────────────────────
  const envLines: string[] = [`APP_NAME=${config.projectName}`];

  if (config.database !== 'none') {
    if (config.database === 'sqlite') {
      envLines.push('DATABASE_URL=file:./dev.db');
    } else {
      const scheme = config.database === 'mysql' ? 'mysql' : 'postgresql';
      const port = config.database === 'mysql' ? 3306 : 5432;
      envLines.push(`DATABASE_URL=${scheme}://user:password@localhost:${port}/${config.slug}`);
    }
  }

  if (config.frontend === 'nextjs') {
    envLines.push('NEXTAUTH_URL=http://localhost:3000', 'NEXTAUTH_SECRET=change-me');
  }
  if (config.frontend === 'vite-react') {
    envLines.push('VITE_API_URL=http://localhost:3000');
  }

  if (config.auth.includes('google')) {
    envLines.push('GOOGLE_CLIENT_ID=', 'GOOGLE_CLIENT_SECRET=');
  }
  if (config.auth.includes('github')) {
    envLines.push('GITHUB_CLIENT_ID=', 'GITHUB_CLIENT_SECRET=');
  }

  if (config.billing === 'stripe') {
    envLines.push(
      'STRIPE_SECRET_KEY=sk_test_...',
      'STRIPE_WEBHOOK_SECRET=whsec_...',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...'
    );
  } else if (config.billing === 'lemon-squeezy') {
    envLines.push(
      'LEMONSQUEEZY_API_KEY=',
      'LEMONSQUEEZY_WEBHOOK_SECRET=',
      'LEMONSQUEEZY_STORE_ID='
    );
  }

  if (config.aiProviders.includes('openai')) envLines.push('OPENAI_API_KEY=sk-...');
  if (config.aiProviders.includes('anthropic')) envLines.push('ANTHROPIC_API_KEY=sk-ant-...');
  if (config.aiProviders.includes('replicate')) envLines.push('REPLICATE_API_TOKEN=');

  if (config.email === 'resend') {
    envLines.push('RESEND_API_KEY=re_...');
  } else if (config.email === 'mailgun') {
    envLines.push('MAILGUN_API_KEY=', 'MAILGUN_DOMAIN=');
  }

  if (config.storage === 's3') {
    envLines.push(
      'AWS_ACCESS_KEY_ID=',
      'AWS_SECRET_ACCESS_KEY=',
      'AWS_REGION=us-east-1',
      'AWS_S3_BUCKET='
    );
  } else if (config.storage === 'cloudflare-r2') {
    envLines.push(
      'CLOUDFLARE_R2_ACCOUNT_ID=',
      'CLOUDFLARE_R2_ACCESS_KEY_ID=',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY=',
      'CLOUDFLARE_R2_BUCKET='
    );
  }

  if (config.backend === 'express') envLines.push('PORT=3000');
  if (config.backend === 'fastapi') envLines.push('PORT=8000');

  root.file('.env.example', envLines.join('\n'));

  // ── Frontend ────────────────────────────────────────────────────────────────
  const frontendFolder = root.folder('frontend');

  if (config.frontend === 'vite-react') {
    const tpl = TEMPLATES['vite-react'].files;
    Object.entries(tpl).forEach(([name, content]) => {
      if (name !== '.env.example') frontendFolder?.file(name, content);
    });
  } else {
    // nextjs
    const tpl = TEMPLATES['next'].files;
    Object.entries(tpl).forEach(([name, content]) => {
      if (name !== '.env.example') frontendFolder?.file(name, content);
    });
  }

  // ── Backend ─────────────────────────────────────────────────────────────────
  if (config.backend !== 'none') {
    const backendFolder = root.folder('backend');

    if (config.backend === 'express') {
      const tpl = TEMPLATES['express'].files;
      Object.entries(tpl).forEach(([name, content]) => {
        if (name !== '.env.example') backendFolder?.file(name, content);
      });
    } else {
      // fastapi
      backendFolder?.file(
        'main.py',
        [
          'from fastapi import FastAPI',
          '',
          'app = FastAPI()',
          '',
          '@app.get("/health")',
          'def health():',
          '    return {"status": "ok"}',
        ].join('\n')
      );
      backendFolder?.file(
        'requirements.txt',
        [
          'fastapi>=0.110.0',
          'uvicorn[standard]>=0.27.0',
          'python-dotenv>=1.0.0',
        ].join('\n')
      );
      backendFolder?.file(
        'Dockerfile',
        [
          'FROM python:3.12-slim',
          'WORKDIR /app',
          'ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1',
          'COPY requirements.txt .',
          'RUN pip install --no-cache-dir -r requirements.txt',
          'COPY . .',
          'EXPOSE 8000',
          'CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]',
        ].join('\n')
      );
    }
  }

  // ── ORM ─────────────────────────────────────────────────────────────────────
  if (config.database !== 'none') {
    if (config.orm === 'prisma') {
      const providerMap: Record<string, string> = {
        postgres: 'postgresql',
        mysql: 'mysql',
        sqlite: 'sqlite',
      };
      root.file(
        'prisma/schema.prisma',
        [
          'generator client {',
          '  provider = "prisma-client-js"',
          '}',
          '',
          'datasource db {',
          `  provider = "${providerMap[config.database]}"`,
          '  url      = env("DATABASE_URL")',
          '}',
        ].join('\n')
      );
    } else if (config.orm === 'drizzle') {
      const dialectMap: Record<string, string> = {
        postgres: 'postgresql',
        mysql: 'mysql',
        sqlite: 'sqlite',
      };
      root.file(
        'drizzle.config.ts',
        [
          'import type { Config } from "drizzle-kit";',
          '',
          'export default {',
          '  schema: "./src/db/schema.ts",',
          '  out: "./drizzle",',
          `  dialect: "${dialectMap[config.database]}",`,
          '  dbCredentials: {',
          '    url: process.env.DATABASE_URL!,',
          '  },',
          '} satisfies Config;',
        ].join('\n')
      );
    }
  }

  // ── Deployment ───────────────────────────────────────────────────────────────
  if (config.deployment === 'docker') {
    const dockerFiles = TEMPLATES['docker'].files;
    root.file('docker-compose.yml', dockerFiles['docker-compose.yml']);
    root.file('.dockerignore', dockerFiles['.dockerignore']);
  } else if (config.deployment === 'railway') {
    root.file(
      'railway.json',
      JSON.stringify(
        {
          $schema: 'https://railway.app/railway.schema.json',
          build: { builder: 'NIXPACKS' },
          deploy: {
            numReplicas: 1,
            sleepApplication: false,
            restartPolicyType: 'ON_FAILURE',
          },
        },
        null,
        2
      )
    );
  } else if (config.deployment === 'coolify') {
    root.file(
      'coolify.yml',
      [
        '# Coolify deployment configuration',
        '# See https://coolify.io/docs for more information',
        'version: "1"',
        `name: ${config.slug}`,
      ].join('\n')
    );
  }

  // ── CI workflow ───────────────────────────────────────────────────────────
  const ciFiles = TEMPLATES['github-actions'].files;
  root.file('.github/workflows/ci.yml', ciFiles['.github/workflows/ci.yml']);

  // ── README ───────────────────────────────────────────────────────────────────
  const readmeLines = [
    `# ${config.projectName}`,
    '',
    '## Stack',
    '',
    `| Layer | Choice |`,
    `|-------|--------|`,
    `| Frontend | ${config.frontend} |`,
    `| Backend | ${config.backend} |`,
    `| Database | ${config.database} |`,
    `| ORM | ${config.orm} |`,
    `| Auth | ${config.auth.length ? config.auth.join(', ') : 'none'} |`,
    `| Billing | ${config.billing} |`,
    `| Email | ${config.email} |`,
    `| Storage | ${config.storage} |`,
    `| Deployment | ${config.deployment} |`,
    config.aiProviders.length ? `| AI Providers | ${config.aiProviders.join(', ')} |` : null,
    config.modules.length ? `| Modules | ${config.modules.join(', ')} |` : null,
    '',
    '## Getting started',
    '',
    '```bash',
    '# 1. Copy environment variables',
    'cp .env.example .env',
    '# Fill in the values in .env',
    '```',
  ].filter((l): l is string => l !== null);

  if (config.backend === 'express') {
    readmeLines.push(
      '',
      '### Backend',
      '```bash',
      'cd backend && npm install && node server.js',
      '```'
    );
  } else if (config.backend === 'fastapi') {
    readmeLines.push(
      '',
      '### Backend',
      '```bash',
      'cd backend && pip install -r requirements.txt && uvicorn main:app --reload',
      '```'
    );
  }

  if (config.frontend === 'vite-react' || config.frontend === 'nextjs') {
    readmeLines.push(
      '',
      '### Frontend',
      '```bash',
      'cd frontend && npm install && npm run dev',
      '```'
    );
  }

  if (config.deployment === 'docker') {
    readmeLines.push('', '### Docker', '```bash', 'docker-compose up --build', '```');
  }

  root.file('README.md', readmeLines.join('\n'));

  return zip.generateAsync({ type: 'nodebuffer' });
}
