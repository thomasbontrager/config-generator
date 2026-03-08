import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <Link href="/dashboard" className="font-bold text-xl">
            ⚡ ShipForge
          </Link>
          <nav className="flex items-center space-x-6 ml-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/generator"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Generator
            </Link>
            <Link
              href="/dashboard/configs"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              History
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
