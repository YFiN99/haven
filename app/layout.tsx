import './globals.css';
import { Providers } from './providers';
import Navbar from './components/Navbar'; // Pastiin impor cuma sekali

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Providers>
          <Navbar /> 
          <main className="min-h-screen pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}