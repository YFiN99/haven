'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { ROUTER_ADDRESS, ROUTER_ABI, WETH_ADDRESS, TOKEN_ADDRESS } from './constants';

export default function HavenExchange() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const { writeContract, isPending } = useWriteContract();

  const handleSwap = () => {
    if (!isConnected) return alert("Konek wallet jirr!");
    if (!amount) return alert("Isi jumlahnya!");

    writeContract({
      address: ROUTER_ADDRESS,
      abi: ROUTER_ABI,
      functionName: 'swapExactETHForTokens',
      args: [
        BigInt(0), 
        [WETH_ADDRESS, TOKEN_ADDRESS],
        address as `0x${string}`,
        BigInt(Math.floor(Date.now() / 1000) + 600),
      ],
      value: parseEther(amount),
    });
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-10">
        
        {/* SWAP SECTION */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <div className="bg-pink-600 px-3 py-1 w-fit mb-6 font-black italic uppercase text-sm">Haven Swap</div>
          <div className="bg-black p-4 rounded-xl border border-zinc-800 mb-6">
            <input 
              type="number" 
              placeholder="0.0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-3xl font-bold outline-none w-full text-white"
            />
          </div>
          <button 
            onClick={handleSwap}
            disabled={isPending}
            className="w-full bg-white text-black py-4 rounded-xl font-black uppercase hover:bg-pink-600 hover:text-white transition-all"
          >
            {isPending ? 'Processing...' : 'SWAP NOW'}
          </button>
        </div>

        {/* FARM SECTION */}
        <div className="flex-1">
          <div className="bg-blue-600 px-3 py-1 w-fit mb-6 font-black italic uppercase text-sm">Active Farms</div>
          <div className="bg-zinc-900 border-2 border-white p-6 relative shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-center mb-6">
              <span className="font-black italic text-xl">HAV-USDC</span>
              <span className="text-green-400 font-bold text-xs uppercase">1,240% APR</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-black py-2 font-bold text-xs uppercase hover:bg-pink-600 transition-all">Stake</button>
              <button className="px-4 border border-white py-2 font-bold text-xs uppercase">Claim</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}