'use client';
import React, { useState } from 'react';
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { TOKEN_LIST, ROUTER_ADDRESS, WHT_ADDRESS } from '../constant/tokenlist';
import { ROUTER_ABI } from '../constant/abi';

export default function SwapBox({ onSwap, isPending }: { onSwap: (amt: string, path: string[]) => void, isPending: boolean }) {
  const { address } = useAccount();
  const [sellToken, setSellToken] = useState(TOKEN_LIST[0]);
  const [buyToken, setBuyToken] = useState(TOKEN_LIST[1]);
  const [sellAmount, setSellAmount] = useState('');

  // 1. Live Balance
  const { data: balance } = useBalance({ 
    address, 
    token: sellToken.address as `0x${string}` || undefined 
  });

  // 2. Logic Path: Pastiin gak duplikat biar Router gak pusing
  const path = [
    sellToken.address || WHT_ADDRESS,
    buyToken.address || WHT_ADDRESS
  ];

  // 3. Get Real Price (getAmountsOut)
  const { data: amountsOut } = useReadContract({
    address: ROUTER_ADDRESS as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'getAmountsOut',
    // Cek sellAmount beneran ada angka dan bukan nol jirr
    args: sellAmount && parseFloat(sellAmount) > 0 ? [parseUnits(sellAmount, sellToken.decimals), path] : undefined,
    query: { 
        enabled: !!sellAmount && parseFloat(sellAmount) > 0 && (sellToken.symbol !== buyToken.symbol),
        refetchInterval: 5000 // <--- FIX TYPO JIRR (Bukan refreshInterval)
    }
  });

  const buyAmount = amountsOut ? formatUnits((amountsOut as any)[1], buyToken.decimals) : '0.0000';

  return (
    <div className="w-full max-w-[480px] bg-[#0c0c0c] border border-zinc-800 rounded-[32px] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
      <h2 className="text-white font-black italic uppercase text-[10px] mb-8 border-b-2 border-haven-pink w-fit tracking-widest">Haven Pro Swap</h2>
      
      {/* INPUT SELL */}
      <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800 mb-1 focus-within:border-haven-pink/40 transition-all">
        <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
          <span>You Sell</span>
          <span className="italic">Bal: {balance?.formatted.slice(0, 6) || '0.00'} {sellToken.symbol}</span>
        </div>
        <div className="flex items-center gap-4">
          <input type="number" placeholder="0.0" value={sellAmount} onChange={(e) => setSellAmount(e.target.value)}
            className="bg-transparent text-4xl font-black outline-none w-full text-white placeholder-zinc-900" />
          
          <select 
            value={sellToken.symbol}
            onChange={(e) => setSellToken(TOKEN_LIST.find(t => t.symbol === e.target.value)!)}
            className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black outline-none cursor-pointer hover:border-haven-pink text-white"
          >
            {TOKEN_LIST.map(t => <option key={t.symbol} value={t.symbol} className="bg-zinc-900">{t.logo} {t.symbol}</option>)}
          </select>
        </div>
      </div>

      {/* SWITCH */}
      <div className="flex justify-center -my-4 relative z-10">
        <button 
          onClick={() => { const t = sellToken; setSellToken(buyToken); setBuyToken(t); }}
          className="bg-[#141414] border-4 border-[#0c0c0c] p-2 rounded-xl text-haven-pink shadow-xl hover:scale-110 active:rotate-180 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
        </button>
      </div>

      {/* INPUT BUY */}
      <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800 mt-1 mb-6 focus-within:border-haven-pink/40 transition-all">
        <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
          <span>You Buy (Est.)</span>
        </div>
        <div className="flex items-center gap-4">
          <input readOnly value={buyAmount === '0.0000' ? '' : parseFloat(buyAmount).toFixed(6)} placeholder="0.00"
            className="bg-transparent text-4xl font-black outline-none w-full text-zinc-500" />
          
          <select 
            value={buyToken.symbol}
            onChange={(e) => setBuyToken(TOKEN_LIST.find(t => t.symbol === e.target.value)!)}
            className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black outline-none cursor-pointer hover:border-haven-pink text-white"
          >
            {TOKEN_LIST.map(t => <option key={t.symbol} value={t.symbol} className="bg-zinc-900">{t.logo} {t.symbol}</option>)}
          </select>
        </div>
      </div>

      {/* RATE INFO */}
      <div className="px-4 py-3 mb-6 bg-zinc-950/50 rounded-xl border border-zinc-900 flex justify-between items-center">
        <span className="text-[10px] font-black text-zinc-600 uppercase">Rate</span>
        <span className="text-[10px] font-black text-zinc-400 italic">
          {sellAmount && parseFloat(buyAmount) > 0 ? `1 ${sellToken.symbol} = ${(parseFloat(buyAmount) / parseFloat(sellAmount)).toFixed(6)} ${buyToken.symbol}` : '---'}
        </span>
      </div>
      
      <button 
        onClick={() => onSwap(sellAmount, path)} 
        disabled={isPending || !sellAmount || sellToken.symbol === buyToken.symbol || buyAmount === '0.0000'}
        className="w-full bg-gradient-to-r from-haven-pink to-haven-purple py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] text-white shadow-[0_10px_40px_rgba(255,0,122,0.3)] disabled:grayscale disabled:opacity-50 transition-all"
      >
        {buyAmount === '0.0000' && sellAmount ? 'INSUFFICIENT LIQUIDITY' : (isPending ? 'SWAPPING...' : 'CONFIRM SWAP')}
      </button>
    </div>
  );
}
