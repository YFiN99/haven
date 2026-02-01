'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

// 1. DEFINISIKAN CHAIN DATAHAVEN
const datahaven = defineChain({
  id: 55931,
  name: 'Datahaven Testnet',
  nativeCurrency: { name: 'HAV', symbol: 'HAV', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.datahaven.tech'] },
  },
  blockExplorers: {
    default: { name: 'Datahaven Explorer', url: 'https://explorer.datahaven.tech' },
  },
});

// 2. AMBIL PROJECT ID DARI ENV
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '93a6b83f06059d4359483c613098394e';

const config = getDefaultConfig({
  appName: 'Haven App',
  projectId: projectId,
  chains: [datahaven, mainnet],
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