'use client';
import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { TOKEN_LIST } from '../constant/tokenlist';

export default function Liquidity() {
  const { address } = useAccount();
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'remove'>('add');
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [removePercent, setRemovePercent] = useState(0);

  // Hook saldo biar gak buta angka jirr
  const { data: balA } = useBalance({ address, token: tokenA.address as `0x${string}` || undefined });
  const { data: balB } = useBalance({ address, token: tokenB.address as `0x${string}` || undefined });

  return (
    <div className="w-full max-w-[480px] bg-[#0c0c0c] border border-zinc-800 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      
      {/* 1. SUB-TAB NAVIGATION (BIAR DATAR) */}
      <div className="flex gap-6 mb-8 border-b border-zinc-900 pb-4">
        <button 
          onClick={() => setActiveSubTab('add')}
          className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSubTab === 'add' ? 'text-haven-pink border-b-2 border-haven-pink pb-4 -mb-[18px]' : 'text-zinc-600'}`}
        >
          Add Liquidity
        </button>
        <button 
          onClick={() => setActiveSubTab('remove')}
          className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSubTab === 'remove' ? 'text-haven-pink border-b-2 border-haven-pink pb-4 -mb-[18px]' : 'text-zinc-600'}`}
        >
          Remove
        </button>
      </div>

      {activeSubTab === 'add' ? (
        /* UI ADD LIQUIDITY */
        <div className="space-y-2">
          {/* Box Token A */}
          <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
              <span>Input Token</span>
              <span className="italic">Bal: {balA?.formatted.slice(0, 6) || '0.00'}</span>
            </div>
            <div className="flex items-center gap-4">
              <input type="number" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)}
                className="bg-transparent text-3xl font-black outline-none w-full text-white" />
              <select value={tokenA.symbol} onChange={(e) => setTokenA(TOKEN_LIST.find(t => t.symbol === e.target.value)!)}
                className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black">
                {TOKEN_LIST.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-3 relative z-10 text-haven-pink font-black text-xl">+</div>

          {/* Box Token B */}
          <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
              <span>Input Token</span>
              <span className="italic">Bal: {balB?.formatted.slice(0, 6) || '0.00'}</span>
            </div>
            <div className="flex items-center gap-4">
              <input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)}
                className="bg-transparent text-3xl font-black outline-none w-full text-white" />
              <select value={tokenB.symbol} onChange={(e) => setTokenB(TOKEN_LIST.find(t => t.symbol === e.target.value)!)}
                className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black">
                {TOKEN_LIST.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
            </div>
          </div>

          <button className="w-full bg-white text-black mt-8 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-haven-pink hover:text-white transition-all shadow-lg">
            SUPPLY LIKUIDITAS
          </button>
        </div>
      ) : (
        /* UI REMOVE LIQUIDITY (15%-100%) */
        <div className="space-y-6">
          <div className="bg-[#141414] p-8 rounded-[24px] border border-zinc-800 text-center">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 text-left">Amount to Remove</p>
            <h3 className="text-6xl font-black italic mb-8 text-white">{removePercent}%</h3>
            
            {/* SLIDER JIRR */}
            <input 
              type="range" min="0" max="100" value={removePercent}
              onChange={(e) => setRemovePercent(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-haven-pink mb-8"
            />

            {/* PRESET BUTTONS */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((p) => (
                <button 
                  key={p} 
                  onClick={() => setRemovePercent(p)}
                  className={`py-2 rounded-xl text-[10px] font-black border transition-all ${removePercent === p ? 'bg-haven-pink border-haven-pink text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-500'}`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between px-2 text-[9px] font-black text-zinc-500 uppercase italic tracking-tighter">
            <span>Output: {tokenA.symbol} + {tokenB.symbol}</span>
            <span>LP Burning Active</span>
          </div>

          <button 
            disabled={removePercent === 0}
            className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] transition-all ${removePercent > 0 ? 'bg-white text-black hover:bg-haven-pink hover:text-white shadow-lg' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'}`}
          >
            {removePercent === 0 ? 'ENTER PERCENTAGE' : 'CONFIRM REMOVE'}
          </button>
        </div>
      )}
    </div>
  );
}