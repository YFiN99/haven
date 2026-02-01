'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { 
  ROUTER_ADDRESS, 
  ROUTER_ABI, 
  WETH_ADDRESS, 
  TOKEN_ADDRESS,
  DATAHAVEN_CONFIG 
} from './constants';

// --- KOMPONEN SWAP ---
function SwapSection() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const { writeContract, isPending } = useWriteContract();

  const handleSwap = () => {
    if (!isConnected) return alert("Konek dulu jirr!");
    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactETHForTokens',
      args: [
        BigInt(0),
        [WETH_ADDRESS as `0x${string}`, TOKEN_ADDRESS as `0x${string}`],
        address as `0x${string}`,
        BigInt(Math.floor(Date.now() / 1000) + 600),
      ],
      value: parseEther(amount || '0'),
    });
  };

  return (
    <div className="bg-[#131313] border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-10">
      <h2 className="text-3xl font-black italic text-white mb-6 uppercase tracking-tighter">
        <span className="bg-pink-600 px-2">Haven Swap</span>
      </h2>
      <div className="space-y-4">
        <div className="bg-[#1a1a1a] p-4 border-2 border-gray-800">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">You Pay (HAV)</label>
          <input 
            type="number" 
            placeholder="0.0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent text-3xl font-black outline-none w-full text-white"
          />
        </div>
        <button 
          onClick={handleSwap}
          disabled={isPending}
          className="w-full bg-white text-black py-4 font-black text-xl uppercase hover:bg-pink-600 hover:text-white transition-all active:translate-y-1"
        >
          {isPending ? 'WAITING...' : 'SWAP NOW!'}
        </button>
      </div>
    </div>
  );
}

// --- KOMPONEN POOLS/FARM ---
function FarmSection() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#131313] border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden">
        <div className="bg-green-500 text-black font-black text-[10px] absolute top-0 right-0 px-4 py-1 uppercase italic">Live</div>
        <div className="flex gap-4 items-center mb-6">
          <div className="w-12 h-12 bg-pink-600 border-2 border-white flex items-center justify-center font-black text-xl">H</div>
          <div>
            <h3 className="text-white font-black text-xl italic uppercase">HAV-USDC</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase">Staking Pool #0</p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border-2 border-gray-800 p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 font-bold text-xs uppercase">APR</span>
            <span className="text-green-400 font-black">1,240%</span>
          </div>
          <div className="flex justify-between font-black text-white text-lg">
            <span className="text-xs text-gray-400 uppercase">Earned:</span>
            <span>0.00 HAV</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-white text-black font-black py-3 uppercase text-sm hover:bg-pink-600 hover:text-white transition-all">Stake LP</button>
          <button className="px-4 border-2 border-white text-white font-black hover:bg-white hover:text-black transition-all">Claim</button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function HavenExchange() {
  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-10 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b-8 border-white pb-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Haven<br/><span className="text-pink-600">Exchange</span>
            </h1>
            <p className="font-bold text-gray-500 mt-2 uppercase tracking-widest text-sm">Datahaven Testnet</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="bg-white text-black px-4 py-1 font-black uppercase text-sm mb-2 italic">Fee Setter Active</div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <SwapSection />
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-black italic text-white mb-6 uppercase bg-blue-600 w-fit px-2">Active Farms</h2>
            <FarmSection />
          </div>
        </div>
      </div>
    </main>
  );
}