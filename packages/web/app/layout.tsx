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
          <main className="max-w-6xl mx-auto p-4">
            <ConditionalHeader />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}