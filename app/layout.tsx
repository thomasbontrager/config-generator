import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@/components/shared/Analytics';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'ShipForge - Generate Production-Ready Stacks. Ship Faster.',
  description:
    'ShipForge gives you a real foundation for modern products — auth, billing, database, AI, Docker, CI/CD, and GitHub workflows wired into one configurable stack.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
