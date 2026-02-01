'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export default function SwapBox() {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const { writeContract, data: hash, isPending } = useWriteContract();

  const handleSwap = async () => {
    if (!isConnected) return alert("Konek wallet dulu jirr!");
    if (!amount || parseFloat(amount) <= 0) return alert("Isi jumlahnya dulu!");

    try {
      writeContract({
        address: '0x0000000000000000000000000000000000000000', // GANTI PAKE ALAMAT ROUTER/CONTRACT SWAP LO
        abi: [], // MASUKIN ABI ROUTER/SWAP LO DI SINI
        functionName: 'swapExactTokensForTokens', // SESUAIIN SAMA CONTRACT LO
        args: [parseEther(amount), 0, [], '0xYourWalletAddress', Math.floor(Date.now() / 1000) + 600],
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#131313] border border-gray-800 rounded-3xl p-6 shadow-2xl">
      <h2 className="text-white font-black italic mb-4 border-b border-pink-500 w-fit">HAVEN SWAP</h2>
      
      <div className="space-y-2">
        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <input 
              type="number" 
              placeholder="0.0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-2xl font-bold outline-none w-full text-white"
            />
            <div className="bg-gray-800 px-3 py-1 rounded-xl flex items-center gap-2">
               <span className="font-bold">HAV</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSwap}
          disabled={isPending}
          className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isPending ? 'Processing...' : 'SWAP ASSETS NOW'}
        </button>
      </div>
    </div>
  );
}