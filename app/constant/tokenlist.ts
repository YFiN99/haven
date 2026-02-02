// app/constant/tokenlist.ts

// Panggil alamat dari .env.local
export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER as `0x${string}`;
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY as `0x${string}`; // TAMBAHIN INI JIRR!
export const WHT_ADDRESS = process.env.NEXT_PUBLIC_WETH as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC as `0x${string}`;
export const DATA_ADDRESS = process.env.NEXT_PUBLIC_DATA as `0x${string}`;

export const TOKEN_LIST = [
  { symbol: 'HAV', name: 'Haven', address: null, logo: '💎', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: USDC_ADDRESS, logo: '💵', decimals: 18 },
  { symbol: 'DATA', name: 'Data Token', address: DATA_ADDRESS, logo: '📊', decimals: 18 }
];