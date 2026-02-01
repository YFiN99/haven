import './globals.css';
import { Providers } from './providers';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Haven Exchange',
  description: 'DEX on Datahaven Network',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black antialiased overflow-x-hidden">
        <Providers>
          <Navbar />
          <div className="pt-24 flex flex-col items-center">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
