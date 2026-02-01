'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

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

// 2. AMBIL PROJECT ID DARI ENV (Dashboard Vercel)
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

const config = getDefaultConfig({
  appName: 'HAVEN EXCHANGE',
  projectId: projectId, 
  chains: [datahaven],
  ssr: true, 
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
