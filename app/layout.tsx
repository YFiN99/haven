import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Haven Exchange | DeFi on DataHaven',
  description: 'The premier decentralized exchange on DataHaven Testnet',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}