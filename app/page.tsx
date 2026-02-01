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
    if (!isConnected) return alert("Konek wallet dulu!");
    if (!amount || parseFloat(amount) <= 0) return alert("Isi jumlah!");

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
    }, {
      onSuccess: (hash) => alert("Transaksi Terkirim! Hash: " + hash),
      onError: (err) => alert("Gagal: " + err.message)
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto pt-10">
        
        {/* Konten Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* BAGIAN SWAP */}
          <div className="bg-[#111] border border-zinc-800 rounded-[32px] p-8 shadow-2xl">
            <h2 className="text-white font-black italic mb-6 border-b-2 border-pink-500 w-fit uppercase text-xl">
              Haven Swap
            </h2>
            
            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-zinc-800 mb-6 flex justify-between items-center group focus-within:border-pink-500 transition-all">
              <input 
                type="number" 
                placeholder="0.0" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-3xl font-bold outline-none w-full text-white"
              />
              <span className="bg-zinc-800 px-4 py-2 rounded-xl text-sm font-black text-pink-500">HAV</span>
            </div>

            <button 
              onClick={handleSwap}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-5 rounded-2xl font-black uppercase tracking-tighter hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? 'CONFIRMING...' : 'SWAP ASSETS NOW'}
            </button>
          </div>

          {/* BAGIAN FARMS */}
          <div>
             <div className="inline-block bg-blue-600 px-4 py-1 font-black italic uppercase mb-6 skew-x-[-10deg]">
                Active Farms
             </div>
             
             <div className="bg-[#111] border-2 border-white p-6 relative shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]">
                <div className="absolute top-0 right-0 bg-green-500 text-black px-3 py-1 text-[10px] font-black italic">LIVE</div>
                <div className="flex gap-4 items-center mb-6">
                  <div className="w-12 h-12 bg-pink-600 border border-white flex items-center justify-center font-black text-xl">H</div>
                  <div>
                    <h3 className="font-black text-lg italic leading-none">HAV-USDC</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Staking Pool #0</p>
                  </div>
                </div>
                
                <div className="bg-zinc-900 p-4 border border-zinc-800 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs font-bold uppercase">Estimated APR</span>
                    <span className="text-green-400 font-black text-lg">1,240%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-white text-black py-3 font-black uppercase text-xs hover:bg-pink-500 hover:text-white transition-all">Stake LP</button>
                  <button className="px-6 border border-white py-3 font-black uppercase text-xs hover:bg-zinc-800 transition-all">Claim</button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}