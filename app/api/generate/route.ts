import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';

const templateConfigs: Record<string, any> = {
  'vite-react': {
    name: 'Vite + React',
    files: {
      '.env.example': 'VITE_API_URL=http://localhost:3000\nVITE_APP_NAME=MyApp',
      'README.md': `# Vite + React Project\n\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Build\n\`\`\`bash\nnpm run build\n\`\`\`\n`,
      'Dockerfile': `FROM node:18-alpine\n\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm install\n\nCOPY . .\n\nRUN npm run build\n\nEXPOSE 3000\n\nCMD ["npm", "run", "preview"]\n`,
    },
  },
  'express': {
    name: 'Express.js',
    files: {
      '.env.example': 'PORT=3000\nNODE_ENV=development',
      'README.md': `# Express.js API\n\n## Installation\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n`,
      'server.js': `const express = require('express');\nrequire('dotenv').config();\n\nconst app = express();\nconst port = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/health', (req, res) => {\n  res.json({ status: 'OK' });\n});\n\napp.listen(port, () => {\n  console.log(\`Server running on port \${port}\`);\n});\n`,
    },
  },
  'docker': {
    name: 'Docker',
    files: {
      'Dockerfile': `FROM node:18-alpine\n\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm install\n\nCOPY . .\n\nEXPOSE 3000\n\nCMD ["npm", "start"]\n`,
      'docker-compose.yml': `version: '3.8'\n\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n`,
    },
  },
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { configTypes } = await request.json();

    if (!configTypes || !Array.isArray(configTypes) || configTypes.length === 0) {
      return NextResponse.json({ error: 'No config types specified' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { generatedConfigs: true },
    });

    if (user?.subscriptionStatus === 'TRIAL' && user.generatedConfigs.length >= 10) {
      return NextResponse.json(
        { error: 'Trial limit reached. Please upgrade to Pro.' },
        { status: 403 }
      );
    }

    const zip = new JSZip();

    for (const configType of configTypes) {
      const config = templateConfigs[configType];
      if (!config) continue;

      const folder = zip.folder(configType);
      if (!folder) continue;

      for (const [filename, content] of Object.entries(config.files)) {
        folder.file(filename, content as string);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'nodebuffer' });

    await prisma.generatedConfig.create({
      data: {
        userId: session.user.id,
        name: `Config ${new Date().toISOString().split('T')[0]}`,
        configType: configTypes.join(', '),
        content: { configTypes },
      },
    });

    return new NextResponse(zipBlob as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="shipforge-config-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
