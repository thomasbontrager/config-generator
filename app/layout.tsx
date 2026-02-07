import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@/components/shared/Analytics';

export const metadata: Metadata = {
  title: 'ShipForge - Config & Boilerplate Generator',
  description: 'Generate configuration files and boilerplates for your projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
