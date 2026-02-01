import { defineChain } from 'viem';

export const datahaven = defineChain({
  id: 55931, // Pastikan ID ini sesuai dengan Chain ID Datahaven
  name: 'Datahaven Testnet',
  nativeCurrency: { name: 'HAVEN', symbol: 'HAV', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://services.datahaven-testnet.network/testnet'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.datahaven-testnet.network' },
  },
});