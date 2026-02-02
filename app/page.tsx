'use client';
import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ROUTER_ADDRESS } from './constant/tokenlist';
import { ROUTER_ABI } from './constant/abi';
import Navbar from './components/Navbar';
import SwapBox from './components/SwapBox';

export default function Page() {
  const [activeTab, setActiveTab] = useState('swap');
  
  // Hook buat nulis ke blockchain
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Tunggu konfirmasi transaksi
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSwap = (amount: string, path: string[]) => {
    if (!amount) return;

    // Panggil fungsi swapExactTokensForTokens (atau swapExactETHForTokens kalo HAV itu Native)
    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens', // Sesuaikan dengan fungsi di Smart Contract lo
      args: [
        parseUnits(amount, 18), // Amount In
        0, // Min Amount Out (Slippage 0 dulu biar gampang)
        path,
        "0xAlamatUserLo", // Nanti ambil dari useAccount
        Math.floor(Date.now() / 1000) + 60 * 10 // Deadline 10 menit
      ],
    });
  };

  return (
    <main className="h-screen w-full bg-black flex flex-col overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex items-center justify-center p-4">
        {activeTab === 'swap' && (
          <SwapBox onSwap={handleSwap} isPending={isPending || isConfirming} />
        )}
        {/* Tab lainnya... */}
      </div>
    </main>
  );
}