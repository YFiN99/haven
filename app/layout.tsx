import './globals.css';
import { Providers } from './providers';
import Navbar from './components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Providers>
          {/* Navbar global di sini */}
          <Navbar /> 
          <main className="min-h-screen pt-24 px-4 flex justify-center">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}