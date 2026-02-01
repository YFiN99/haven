'use client';
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// CSS INI HARUS ADA, KALAU GAK MODALNYA GAK KELIHATAN (TRANSPARAN)
import '@rainbow-me/rainbowkit/styles.css';

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

const config = getDefaultConfig({
  appName: 'HAVEN EXCHANGE',
  projectId: '93a6b83f06059d4359483c613098394e', // GUE HARDCODE ID LO BIAR PASTI JALAN
  chains: [datahaven],
  ssr: true, 
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // JANGAN RENDER APAPUN SAMPAI MOUNTED (BIAR GAK BENTROK SAMA SERVER)
  if (!mounted) return <div style={{ visibility: 'hidden' }}>{children}</div>;

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
