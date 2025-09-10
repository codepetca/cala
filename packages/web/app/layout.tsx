import './globals.css';
import Providers from './providers';
import { AppShell } from '@/components/app/AppShell';
import { HeaderProvider } from '@/components/app/HeaderContext';

export const metadata = {
  title: 'Trip Planner',
  description: 'Plan trips collaboratively in real time.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
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
          <HeaderProvider>
            <AppShell>
              {children}
            </AppShell>
          </HeaderProvider>
        </Providers>
      </body>
    </html>
  );
}