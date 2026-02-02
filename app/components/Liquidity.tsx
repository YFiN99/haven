'use client';
import React, { useState } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { TOKEN_LIST, ROUTER_ADDRESS, WHT_ADDRESS } from '../constant/tokenlist';

// ABI minimal untuk token (approve, allowance) dan router (addLiquidityETH)
const TOKEN_ABI = [
  {
    constant: false,
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "success", type: "bool" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function"
  }
] as const;

const ROUTER_ABI = [
  {
    inputs: [
      { name: "token", type: "address" },
      { name: "amountTokenDesired", type: "uint256" },
      { name: "amountTokenMin", type: "uint256" },
      { name: "amountETHMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" }
    ],
    name: "addLiquidityETH",
    outputs: [
      { name: "amountToken", type: "uint256" },
      { name: "amountETH", type: "uint256" },
      { name: "liquidity", type: "uint256" }
    ],
    stateMutability: "payable",
    type: "function"
  }
] as const;

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'remove'>('add');
  const [tokenA, setTokenA] = useState(TOKEN_LIST[0]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isNativeA = tokenA?.address?.toLowerCase() === WHT_ADDRESS?.toLowerCase();

  const { data: balA } = useBalance({ 
    address, 
    token: isNativeA ? undefined : (tokenA?.address as `0x${string}`) 
  });
  const { data: balB } = useBalance({ address });

  const { data: allowanceData } = useReadContract({
    address: tokenA?.address as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: address && ROUTER_ADDRESS ? [address, ROUTER_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address && !!tokenA?.address && !isNativeA }
  });

  // Pastikan allowance selalu bigint (default 0 jika undefined)
  const allowance = allowanceData ?? BigInt(0);

  const handleAddLiquidity = () => {
    if (!isConnected || !address) {
      setErrorMsg("Konekin dompet dulu bro!");
      return;
    }

    if (!amountA || !amountB || Number(amountA) <= 0 || Number(amountB) <= 0) {
      setErrorMsg("Masukin jumlah token & HAV yang valid (> 0)");
      return;
    }

    const amountTokenDesired = parseUnits(amountA, 18);
    const amountETHDesired   = parseUnits(amountB, 18);

    // Slippage tolerance 3%
    const slippage = BigInt(97);
    const hundred  = BigInt(100);

    const amountTokenMin = (amountTokenDesired * slippage) / hundred;
    const amountETHMin   = (amountETHDesired   * slippage) / hundred;

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 30); // 30 menit

    // Cek approval jika bukan native token
    if (!isNativeA) {
      if (allowance < amountTokenDesired) {
        writeContract({
          address: tokenA?.address as `0x${string}`,
          abi: TOKEN_ABI,
          functionName: 'approve',
          args: [ROUTER_ADDRESS as `0x${string}`, amountTokenDesired * BigInt(2)],
        });
        setErrorMsg(null);
        return;
      }
    }

    // Reset error sebelum kirim
    setErrorMsg(null);

    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'addLiquidityETH',
      args: [
        tokenA?.address as `0x${string}`,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        address,
        deadline
      ],
      value: amountETHDesired,
    });
  };

  const buttonText = (() => {
    if (isPending || isConfirming) return 'COOKING...';
    if (!isNativeA && allowance === BigInt(0)) return 'APPROVE TOKEN';
    return 'SUPPLY LIKUIDITAS';
  })();

  return (
    <div className="w-full max-w-[480px] bg-[#0c0c0c] border border-zinc-800 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex gap-6 mb-8 border-b border-zinc-900 pb-4">
        {['add', 'remove'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveSubTab(tab as any)} 
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeSubTab === tab 
                ? 'text-haven-pink border-b-2 border-haven-pink pb-4 -mb-[18px]' 
                : 'text-zinc-600'
            }`}
          >
            {tab === 'add' ? 'Add Liquidity' : 'Remove'}
          </button>
        ))}
      </div>

      {activeSubTab === 'add' ? (
        <div className="space-y-2">
          {/* Token Input */}
          <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
              <span>Token</span>
              <span className="italic">
                Bal: {balA ? formatUnits(balA.value, 18).slice(0, 8) : '0.00'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="bg-transparent text-3xl font-black outline-none w-full text-white"
              />
              <select
                value={tokenA?.symbol}
                onChange={(e) => setTokenA(TOKEN_LIST.find(t => t.symbol === e.target.value)!)}
                className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black"
              >
                {TOKEN_LIST
                  .filter(t => t?.address && t.address.toLowerCase() !== WHT_ADDRESS?.toLowerCase())
                  .map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-3 relative z-10 text-haven-pink font-black text-xl">+</div>

          {/* HAV / Native Input */}
          <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800">
            <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase mb-3">
              <span>HAV (Native)</span>
              <span className="italic">
                Bal: {balB ? formatUnits(balB.value, 18).slice(0, 8) : '0.00'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="bg-transparent text-3xl font-black outline-none w-full text-white"
              />
              <div className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-black text-haven-pink italic">
                HAV
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-red-500 text-sm text-center mt-2">
              {errorMsg}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleAddLiquidity}
            disabled={isPending || isConfirming}
            className="w-full bg-white text-black mt-8 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-haven-pink hover:text-white transition-all shadow-lg disabled:opacity-50"
          >
            {buttonText}
          </button>

          {hash && (
            <div className="mt-4 p-3 bg-zinc-900 rounded-xl text-[8px] font-mono text-zinc-500 break-all text-center">
              TX: {hash}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 py-10 text-center">
          <p className="text-[10px] text-zinc-600 font-black uppercase">Coming Soon Jirr!</p>
        </div>
      )}
    </div>
  );
}
