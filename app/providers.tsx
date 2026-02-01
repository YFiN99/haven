'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// 1. DEFINISIKAN CHAIN DATAHAVEN (Ini kuncinya!)
const datahaven = defineChain({
  id: 55931,
  name: 'Datahaven Testnet',
  nativeCurrency: { name: 'HAV', symbol: 'HAV', decimals: 18 },
  rpcUrls: {
    // Tanda kutip di akhir "testnet" tadi yang bikin error saldo 0
    default: { http: ['https://services.datahaven-testnet.network/testnet'] }, 
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://testnet.dhscan.io' },
  },
});

const config = getDefaultConfig({
  appName: 'HAVEN EXGANGE',
  projectId: '93a6...isi_project_id_lo', // Ambil dari walletconnect cloud
  chains: [datahaven], // PAKAI DATAHAVEN, JANGAN MAINNET!
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