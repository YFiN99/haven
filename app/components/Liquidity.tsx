'use client';
import React, { useState } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { TOKEN_LIST, ROUTER_ADDRESS, WHT_ADDRESS } from '../constant/tokenlist';

// --- HARDCORE ABI ---
const INTERNAL_ABI = [
  {
    "name": "addLiquidityETH",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amountTokenDesired", "type": "uint256" },
      { "name": "amountTokenMin", "type": "uint256" },
      { "name": "amountETHMin", "type": "uint256" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "outputs": [{ "name": "amountToken", "type": "uint256" }, { "name": "amountETH", "type": "uint256" }, { "name": "liquidity", "type": "uint256" }]
  },
  {
    "constant": false,
    "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  }
] as const;

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'remove'>('add');
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]); 
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [removePercent, setRemovePercent] = useState(0);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: balA } = useBalance({ address, token: (tokenA?.address as `0x${string}`) || undefined });
  const { data: balB } = useBalance({ address });

  const isNativeA = tokenA?.address?.toLowerCase() === WHT_ADDRESS?.toLowerCase();
  
  const { data: allowance } = useReadContract({
    address: tokenA?.address as `0x${string}`,
    abi: INTERNAL_ABI,
    functionName: 'allowance',
    args: address && ROUTER_ADDRESS ? [address, ROUTER_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address && !!tokenA?.address && !isNativeA }
  });

  const handleAction = async () => {
    if (!isConnected || !address) return alert("Konekin dompet jirr!");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    if (activeSubTab === 'add') {
      const pA = parseUnits(amountA || "0", 18);
      const pB = parseUnits(amountB || "0", 18);

      if (!isNativeA && (!allowance || (allowance as bigint) < pA)) {
        return writeContract({
          address: tokenA?.address as `0x${string}`,
          abi: INTERNAL_ABI,
          functionName: 'approve',
          args: [ROUTER_ADDRESS as `0x${string}`, parseUnits("1000000000", 18)],
        });
      }

      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: INTERNAL_ABI,
        functionName: 'addLiquidityETH',
        args: [tokenA?.address as `0x${string}`, pA, BigInt(0), BigInt(0), address, deadline],
        value: pB,
      });
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-[#0c0c0c] border border-zinc-800 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex gap-6 mb-8 border-b border-zinc-900 pb-4">
        {['add', 'remove'].map((tab) => (
          <button key={tab} onClick={() => setActiveSubTab(tab as any)} 
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSubTab === tab ? 'text-haven-pink border-b-2 border-haven-pink pb-4 -mb-[18px]' : 'text-zinc-600'}`}>
            {tab === 'add' ? 'Add Liquidity' : 'Remove'}
          </button>
        ))}
      </div>

      {activeSubTab === 'add' ? (
        <div className="space-y-2">
          <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
              <span>Token</span>
              <span className="italic">Bal: {balA?.formatted.slice(0, 6) || '0.00'}</span>
            </div>
            <div className="flex items-center gap-4">
              <input type="number" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)} className="bg-transparent text-3xl font-black outline-none w-full text-white" />
              <select value={tokenA?.symbol} onChange={(e) => setTokenA(TOKEN_LIST.find(t => t.symbol === e.target.value)!)} className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black">
                {TOKEN_LIST.filter(t => t?.address && t.address.toLowerCase() !== WHT_ADDRESS?.toLowerCase()).map(t => (
                  <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-3 relative z-10 text-haven-pink font-black text-xl">+</div>

          <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
              <span>HAV (Native)</span>
              <span className="italic">Bal: {balB?.formatted.slice(0, 6) || '0.00'}</span>
            </div>
            <div className="flex items-center gap-4">
              <input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)} className="bg-transparent text-3xl font-black outline-none w-full text-white" />
              <div className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black text-haven-pink italic">HAV</div>
            </div>
          </div>

          <button onClick={handleAction} disabled={isPending || isConfirming}
            className="w-full bg-white text-black mt-8 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-haven-pink hover:text-white transition-all shadow-lg disabled:opacity-50">
            {isPending || isConfirming ? 'COOKING...' : (allowance && (allowance as bigint) > 0 ? 'SUPPLY LIKUIDITAS' : 'APPROVE TOKEN')}
          </button>
        </div>
      ) : (
        <div className="space-y-6 py-10 text-center">
          <p className="text-[10px] text-zinc-600 font-black uppercase">Coming Soon Jirr!</p>
        </div>
      )}
      
      {hash && <div className="mt-4 p-3 bg-zinc-900 rounded-xl text-[8px] font-mono text-zinc-500 break-all text-center">TX: {hash}</div>}
    </div>
  );
}
