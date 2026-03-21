import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const TEMPLATES = [
  {
    id: 'vite-react',
    name: 'Vite + React',
    description: 'Lightning-fast SPA with Hot Module Replacement. Includes Docker, env template, and CI workflow.',
    icon: '⚡',
    tags: ['frontend', 'react', 'typescript'],
  },
  {
    id: 'vue3',
    name: 'Vue 3',
    description: 'Progressive JavaScript framework setup with Vite. Includes Docker and GitHub Actions.',
    icon: '💚',
    tags: ['frontend', 'vue', 'typescript'],
  },
  {
    id: 'next',
    name: 'Next.js',
    description: 'Full-stack React framework with App Router, TypeScript, Tailwind, and Prisma.',
    icon: '▲',
    tags: ['fullstack', 'react', 'typescript'],
  },
  {
    id: 'express',
    name: 'Express API',
    description: 'Node.js REST API with Prisma, JWT auth, rate limiting, and Docker.',
    icon: '🚀',
    tags: ['backend', 'nodejs', 'typescript'],
  },
  {
    id: 'django',
    name: 'Django',
    description: 'Python web framework with Docker Compose, PostgreSQL, and Celery config.',
    icon: '🐍',
    tags: ['backend', 'python'],
  },
  {
    id: 'docker',
    name: 'Docker',
    description: 'Production-ready multi-stage Dockerfile and docker-compose for any app.',
    icon: '🐳',
    tags: ['devops', 'docker'],
  },
  {
    id: 'k8s',
    name: 'Kubernetes',
    description: 'Deployment, Service, ConfigMap, Ingress, and HPA manifests for K8s.',
    icon: '☸️',
    tags: ['devops', 'kubernetes'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    description: 'CI/CD workflows for lint, test, build, and deploy to multiple targets.',
    icon: '🔄',
    tags: ['ci-cd', 'devops'],
  },
];

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground mt-2">
            Browse all available config templates — select any combination to generate your ZIP
          </p>
        </div>
        <Link href="/dashboard/generator">
          <Button>Open Generator</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <Card key={template.id} className="hover:border-primary/60 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">{template.description}</CardDescription>
              <Link href={`/dashboard/generator?types=${template.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  Generate this template
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
