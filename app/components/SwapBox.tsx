'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
// Pastiin path-nya bener ke file constants lo jirr!
import { ROUTER_ADDRESS, ROUTER_ABI, WETH_ADDRESS, TOKEN_ADDRESS } from '../constants';

export default function SwapBox() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const { writeContract, isPending } = useWriteContract();

  const handleSwap = async () => {
    if (!isConnected) return alert("Konek wallet dulu jirr!");
    if (!amount || parseFloat(amount) <= 0) return alert("Isi jumlahnya!");

    try {
      writeContract({
        // Tambahin 'as `0x${string}`' biar TypeScript diem!
        address: ROUTER_ADDRESS as `0x${string}`, 
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokens', 
        args: [
          BigInt(0), 
          [WETH_ADDRESS as `0x${string}`, TOKEN_ADDRESS as `0x${string}`], 
          address as `0x${string}`, 
          BigInt(Math.floor(Date.now() / 1000) + 600),
        ],
        value: parseEther(amount),
      });
    } catch (e) {
      console.error("Gagal total:", e);
    }
  };

  return (
    <div className="bg-[#131313] border border-gray-800 rounded-3xl p-6 shadow-2xl">
      <h2 className="text-white font-black italic mb-4 border-b border-pink-500 w-fit">HAVEN SWAP</h2>
      
      <div className="space-y-2">
        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800">
          <input 
            type="number" 
            placeholder="0.0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent text-2xl font-bold outline-none w-full text-white"
          />
        </div>

        <button 
          onClick={handleSwap}
          disabled={isPending}
          className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isPending ? 'SABAR JIRR...' : 'SWAP SEKARANG!'}
        </button>
      </div>
    </div>
  );
}