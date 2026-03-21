import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardNavSignOut } from './components/DashboardNavSignOut';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center px-4 container mx-auto gap-6">
          <Link href="/dashboard" className="font-bold text-xl shrink-0">
            ⚡ ShipForge
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <Link
              href="/dashboard"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/stacks"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Stacks
            </Link>
            <Link
              href="/dashboard/templates"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Templates
            </Link>
            <Link
              href="/dashboard/generator"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Generator
            </Link>
            <Link
              href="/dashboard/projects"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Projects
            </Link>
            <Link
              href="/dashboard/configs"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              History
            </Link>
            <Link
              href="/dashboard/integrations"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Integrations
            </Link>
            <Link
              href="/dashboard/team"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Team
            </Link>
            <Link
              href="/dashboard/activity"
              className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            >
              Activity
            </Link>
            {session.user?.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors text-violet-400 hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link href="/dashboard/api-keys">
              <Button variant="ghost" size="sm">
                API Keys
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button variant="ghost" size="sm">
                Billing
              </Button>
            </Link>
            <DashboardNavSignOut />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
