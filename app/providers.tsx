'use client';
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

<<<<<<< HEAD
=======
// 1. DEFINISIKAN CHAIN DATAHAVEN
>>>>>>> d2b95ba (fix: use env variable for project id and fix typo)
const datahaven = defineChain({
  id: 55931,
  name: 'Datahaven Testnet',
  nativeCurrency: { name: 'HAV', symbol: 'HAV', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://services.datahaven-testnet.network/testnet'] }, 
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://testnet.dhscan.io' },
  },
});

<<<<<<< HEAD
=======
// 2. AMBIL PROJECT ID DARI ENV (Dashboard Vercel)
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

const config = getDefaultConfig({
  appName: 'HAVEN EXCHANGE',
  projectId: projectId, 
  chains: [datahaven],
  ssr: true, 
});

>>>>>>> d2b95ba (fix: use env variable for project id and fix typo)
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const config = getDefaultConfig({
    appName: 'HAVEN EXCHANGE',
    projectId: '93a6b83f06059d4359483c613098394e', // Pakai ID ini biar build aman
    chains: [datahaven],
    ssr: true, 
  });

  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
