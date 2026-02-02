'use client';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Definisi Network Datahaven Testnet
const datahavenTestnet = {
  id: 55931, // GANTI DENGAN CHAIN ID ASLI DATAHAVEN LO JIRRR
  name: 'Datahaven Testnet',
  nativeCurrency: { name: 'Haven', symbol: 'HAV', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL!] },
  },
};

const config = getDefaultConfig({
  appName: 'Haven Exchange',
  projectId: 'YOUR_PROJECT_ID', // Dapet dari cloud.walletconnect.com
  chains: [datahavenTestnet],
  transports: {
    [datahavenTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}