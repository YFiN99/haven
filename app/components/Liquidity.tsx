'use client';
import React, { useState } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { TOKEN_LIST, ROUTER_ADDRESS, WHT_ADDRESS } from '../constant/tokenlist';
import { ROUTER_ABI, ERC20_ABI } from '../constant/abi';

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'remove'>('add');
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]); 
  const [tokenB, setTokenB] = useState(TOKEN_LIST[1]); 
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [removePercent, setRemovePercent] = useState(0);

  // Hook Transaksi
  const { writeContract, data: hash, isPending: isWalletPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Hook Saldo
  const { data: balA } = useBalance({ address, token: (tokenA?.address as `0x${string}`) || undefined });
  const { data: balB } = useBalance({ address, token: (tokenB?.address as `0x${string}`) || undefined });

  // CEK ALLOWANCE (Fix Type Error jirr)
  const isSellingNative = tokenA?.address?.toLowerCase() === WHT_ADDRESS?.toLowerCase();
  
  const { data: allowance } = useReadContract({
    address: tokenA?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && ROUTER_ADDRESS ? [address, ROUTER_ADDRESS as `0x${string}`] : undefined,
    query: { 
      enabled: !!address && !!tokenA?.address && !isSellingNative 
    }
  });

  const handleSupply = async () => {
    if (!isConnected || !address) return alert("Konekin dompet jirr!");
    if (!amountA || !amountB) return alert("Isi jumlahnya dulu!");

    const pAmountA = parseUnits(amountA, 18);
    const pAmountB = parseUnits(amountB, 18);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    // Logic Approve
    if (!isSellingNative) {
      if (!allowance || (allowance as bigint) < pAmountA) {
        writeContract({
          address: tokenA.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [ROUTER_ADDRESS as `0x${string}`, parseUnits("1000000000", 18)],
        });
        return;
      }
    }

    // Add Liquidity
    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'addLiquidityETH',
      args: [
        tokenA.address as `0x${string}`,
        pAmountA,
        BigInt(0),
        BigInt(0),
        address as `0x${string}`,
        deadline
      ],
      value: pAmountB,
    });
  };

  return (
    <div className="w-full max-w-[480px] bg-[#0c0c0c] border border-zinc-800 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      
      {/* SUB-TAB NAVIGATION */}
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
        <div className="space-y-2">
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

          <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
              <span>Input HAV (Native)</span>
              <span className="italic">Bal: {balB?.formatted.slice(0, 6) || '0.00'}</span>
            </div>
            <div className="flex items-center gap-4">
              <input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)}
                className="bg-transparent text-3xl font-black outline-none w-full text-white" />
              <div className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black text-haven-pink">HAV</div>
            </div>
          </div>

          <button 
            onClick={handleSupply}
            disabled={isWalletPending || isConfirming}
            className="w-full bg-white text-black mt-8 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-haven-pink hover:text-white transition-all shadow-lg disabled:opacity-50"
          >
            {isWalletPending || isConfirming ? 'PROCESSING...' : (allowance && (allowance as bigint) > 0 || isSellingNative ? 'SUPPLY LIKUIDITAS' : 'APPROVE TOKEN')}
          </button>
          
          {hash && <p className="text-[9px] text-center mt-4 text-zinc-500 font-bold uppercase tracking-tighter">Tx: {hash.slice(0,12)}...{hash.slice(-8)}</p>}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-700 font-black uppercase text-[10px]">Remove Liquidity Coming Soon</div>
      )}
    </div>
  );
}
