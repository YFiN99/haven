'use client';
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

// 1. DEFINISIKAN CHAIN DATAHAVEN
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

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Mastiin udah di browser (Client Side)
  useEffect(() => {
    setMounted(true);
  }, []);

  const config = getDefaultConfig({
    appName: 'HAVEN EXCHANGE',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '', 
    chains: [datahaven],
    ssr: true, 
  });

  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
