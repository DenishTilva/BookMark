import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Bookmark App',
  description: 'Minimal, real-time bookmark manager powered by Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center px-4">
          {children}
        </div>
      </body>
    </html>
  );
}

