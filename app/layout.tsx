import './globals.css';
import { Providers } from './providers';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Haven Exchange',
  description: 'Datahaven Dex',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Providers>
          <Navbar />
          <main className="pt-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
