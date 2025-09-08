import './globals.css';
import Providers from './providers';
import { AppShell } from '@/components/app/AppShell';

export const metadata = {
  title: 'Trip Planner',
  description: 'Plan trips collaboratively in real time.',
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}