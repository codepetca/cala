import './globals.css';
import Providers from './providers';
import ConditionalHeader from './components/ConditionalHeader';

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
    <html lang="en">
      <body>
        <Providers>
          <ConditionalHeader />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}