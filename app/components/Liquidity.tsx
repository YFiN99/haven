// app/components/Liquidity.tsx
'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ROUTER_ADDRESS } from '../constant/tokenlist';
import { ROUTER_ABI, ERC20_ABI } from '../constant/abi';

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [tokenAddress, setTokenAddress] = useState(''); 
  const [amountToken, setAmountToken] = useState('');   
  const [amountHAV, setAmountHAV] = useState('');       

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSupply = async () => {
    if (!isConnected) return alert("Konekin Wallet Jirr!");
    
    const pToken = parseUnits(amountToken || "0", 18);
    const pHAV = parseUnits(amountHAV || "0", 18);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    // 1. Approve Token dulu (Wajib!)
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ROUTER_ADDRESS as `0x${string}`, pToken],
    });

    // 2. Add Liquidity
    // Sesuai urutan di Solidity lo: token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline
    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'addLiquidityETH',
      args: [
        tokenAddress as `0x${string}`,
        pToken,
        BigInt(0), 
        BigInt(0), 
        address as `0x${string}`,
        deadline
      ],
      value: pHAV, // Kirim Native HAV-nya di sini
    });
  };

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-[32px] backdrop-blur-xl">
      <h2 className="text-2xl font-black italic uppercase mb-8 tracking-tighter">Add Liquidity</h2>
      
      <div className="space-y-6">
        <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800">
          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Token Contract Address</label>
          <input 
            className="w-full bg-transparent outline-none text-sm font-mono"
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Amount Token</label>
            <input 
              className="w-full bg-transparent outline-none text-xl font-black"
              placeholder="0.0"
              value={amountToken}
              onChange={(e) => setAmountToken(e.target.value)}
            />
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Amount HAV</label>
            <input 
              className="w-full bg-transparent outline-none text-xl font-black"
              placeholder="0.0"
              value={amountHAV}
              onChange={(e) => setAmountHAV(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleSupply}
          disabled={isPending || isConfirming}
          className="w-full bg-white text-black h-16 rounded-2xl font-black uppercase italic hover:bg-haven-pink hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending || isConfirming ? "Processing..." : "Supply Liquidity"}
        </button>

        {isSuccess && <p className="text-center text-green-500 text-[10px] font-bold">SUCCESS! CHECK EXPLORER JIRR!</p>}
      </div>
    </div>
  );
}
