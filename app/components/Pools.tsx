'use client';
import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Plus, Search, ChevronDown, Loader2 } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { TOKEN_LIST, WHT_ADDRESS, FACTORY_ADDRESS } from '../constant/tokenlist';

// ABI Buat nyari alamat Pair & Cek Saldo
const FACTORY_ABI = [{ "inputs": [{"name": "tokenA", "type": "address"},{"name": "tokenB", "type": "address"}], "name": "getPair", "outputs": [{"name": "pair", "type": "address"}], "stateMutability": "view", "type": "function" }] as const;
const PAIR_ABI = [{ "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }] as const;

// --- KOMPONEN BARIS POOL (DINAMIS JIRR!) ---
const PoolRow = ({ pair, tokenBAddress, apr, fee, logoB }: any) => {
  const { address } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // 1. CARI ALAMAT PAIR DULU (Biar gak 0x000 lagi)
  const { data: realPairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [WHT_ADDRESS as `0x${string}`, tokenBAddress as `0x${string}`],
    query: { enabled: isClient }
  });

  // 2. CEK SALDO LP DI ALAMAT YANG DIDAPET
  const { data: lpBalance } = useReadContract({
    address: realPairAddress as `0x${string}`,
    abi: PAIR_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isClient && !!address && !!realPairAddress && realPairAddress !== '0x0000000000000000000000000000000000000000' }
  });

  const formattedLP = lpBalance ? Number(formatUnits(lpBalance, 18)).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '0.00';

  return (
    <div className="bg-[#111111]/40 backdrop-blur-md border border-white/5 p-6 rounded-[24px] flex items-center justify-between hover:border-pink-500/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2 text-xl">
           <span className="w-10 h-10 bg-pink-500 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black italic text-white">HAV</span>
           <span className="w-10 h-10 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black italic text-white">{logoB}</span>
        </div>
        <div>
          <h4 className="text-white font-bold text-lg italic tracking-tight">{pair}</h4>
          <p className="text-gray-500 text-[10px] uppercase font-black">Fee: {fee}</p>
        </div>
      </div>
      <div className="text-center hidden md:block">
        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-black">APR</p>
        <p className="text-green-400 font-black italic">{apr}</p>
      </div>
      <div className="text-right">
        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 font-black">My Liquidity</p>
        <p className="text-white font-black italic tracking-wide">
          {formattedLP} <span className="text-pink-500 text-[10px]">LP</span>
        </p>
      </div>
      <a href={`https://explorer.haven.com/address/${realPairAddress}`} target="_blank" rel="noopener noreferrer" className={`p-3 bg-gray-800/30 rounded-xl transition-all border border-white/5 ${!realPairAddress || realPairAddress === '0x000...' ? 'opacity-20 pointer-events-none' : 'hover:bg-pink-500/20 hover:text-pink-500'}`}>
        <ExternalLink className="w-4 h-4 text-white" />
      </a>
    </div>
  );
};

// --- KOMPONEN UTAMA ---
const Pools = () => {
  const { isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tokenA, setTokenA] = useState<string>(WHT_ADDRESS);
  const [tokenB, setTokenB] = useState<string>('');

  useEffect(() => { setMounted(true); }, []);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isCreating, isSuccess } = useWaitForTransactionReceipt({ hash });

  // LIST POOL (Sekarang gak usah input pairAddress, cukup Token B nya aja)
  const pools = [
    { pair: 'HAV/USDC', tokenBAddress: TOKEN_LIST.find(t => t.symbol === 'USDC')?.address, apr: '45.2%', fee: '0.3%', logoB: 'U' },
    { pair: 'HAV/DATA', tokenBAddress: TOKEN_LIST.find(t => t.symbol === 'DATA')?.address, apr: '124.5%', fee: '0.3%', logoB: 'D' },
  ];

  useEffect(() => {
    if (isSuccess) { setShowModal(false); setTokenA(WHT_ADDRESS); setTokenB(''); }
  }, [isSuccess]);

  const handleCreate = () => {
    if (!isConnected) return alert("Konek wallet dulu jirr!");
    writeContract({
      address: FACTORY_ADDRESS,
      abi: [{ "inputs": [{"name": "tokenA", "type": "address"},{"name": "tokenB", "type": "address"}], "name": "createPair", "outputs": [{"name": "pair", "type": "address"}], "stateMutability": "nonpayable", "type": "function" }] as const,
      functionName: 'createPair',
      args: [tokenA as `0x${string}`, tokenB as `0x${string}`],
    });
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Liquidity Pools</h2>
          <p className="text-gray-500 font-bold text-sm uppercase italic">Provide liquidity to earn trading fees</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-white text-black font-black px-8 py-3 rounded-2xl hover:bg-pink-500 hover:text-white transition-all shadow-lg italic uppercase text-sm tracking-widest">
          Create New Pair
        </button>
      </div>

      <div className="grid gap-4">
        {pools.map((pool, i) => (
          <PoolRow key={i} {...pool} />
        ))}
      </div>

      {/* MODAL TETEP SAMA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 text-white">
          <div className="bg-[#0d0d0d] border border-white/10 p-8 rounded-[40px] w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black italic uppercase mb-8">Deploy Pool</h3>
            <div className="space-y-6 mb-10">
              <div className="space-y-2 text-left">
                <label className="text-[10px] text-pink-500 font-black uppercase ml-2 italic">Token A (HAV/WHT)</label>
                <input value={tokenA} onChange={(e) => setTokenA(e.target.value)} className="w-full bg-[#131313] border border-white/5 p-4 rounded-2xl text-[10px] font-mono outline-none" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] text-pink-500 font-black uppercase ml-2 italic">Token B Address</label>
                <div className="relative">
                  <input value={tokenB} onChange={(e) => setTokenB(e.target.value)} placeholder="0x..." className="w-full bg-[#131313] border border-white/5 p-4 rounded-2xl text-[10px] font-mono outline-none pr-24" />
                  <select onChange={(e) => setTokenB(e.target.value)} className="absolute right-2 top-2 bottom-2 bg-[#1a1a1a] text-[10px] font-black px-2 rounded-xl">
                    <option value="">Select</option>
                    {TOKEN_LIST.map(t => <option key={t.symbol} value={t.address}>{t.symbol}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button onClick={handleCreate} disabled={isCreating} className="w-full bg-pink-600 text-white font-black py-5 rounded-[24px] uppercase italic text-xs flex justify-center items-center gap-3">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Create Pair'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pools;