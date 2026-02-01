// app/constant/tokenlist.ts

// 1. Export Alamat Kontrak Utama (Diambil dari .env.local)
export const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER as `0x${string}`;
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY as `0x${string}`;
export const WHT_ADDRESS = process.env.NEXT_PUBLIC_WETH as `0x${string}`;
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC as `0x${string}`;
// Tambahin ini biar gampang dipanggil di komponen Create Pool/Farm
export const DATA_ADDRESS = process.env.NEXT_PUBLIC_DATA as `0x${string}`;

// 2. Export List Token (Bersih & Tanpa WHT Duplikat)
export const TOKEN_LIST = [
  { 
    symbol: 'HAV', 
    name: 'Datahaven Native', 
    address: null, 
    logo: '💎', 
    decimals: 18 
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    address: USDC_ADDRESS, 
    logo: '💵', 
    decimals: 18 
  },
  { 
    symbol: 'DATA', 
    name: 'Data Token', 
    address: DATA_ADDRESS, 
    logo: '📊', 
    decimals: 18 
  }
  // Nanti kalau mau nambah tinggal copy paste slot di bawah ini jirr:
  /*
  { 
    symbol: 'NEW', 
    name: 'New Token', 
    address: process.env.NEXT_PUBLIC_NEW_TOKEN as `0x${string}`, 
    logo: '🚀', 
    decimals: 18 
  },
  */
];