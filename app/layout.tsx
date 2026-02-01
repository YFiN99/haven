// app/layout.tsx
import './globals.css';
import { Providers } from './providers';
import Navbar from './components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Pakai flex-1 dan flex col biar konten di tengah */}
            <main className="flex-1 flex items-center justify-center pt-24 pb-12">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
