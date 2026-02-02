'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// Import Komponen & Constant
import Navbar from './components/Navbar';
import SwapBox from './components/SwapBox';
import Liquidity from './components/Liquidity';
import Farm from './components/Farm';
import Pools from './components/Pools';
import { ROUTER_ADDRESS } from './constant/tokenlist';
import { ROUTER_ABI } from './constant/abi';

export default function Page() {
  const [activeTab, setActiveTab] = useState('swap');
  const { address, isConnected } = useAccount();

  // Hook buat eksekusi transaksi ke blockchain
  const { writeContract, data: hash, isPending: isWalletPending } = useWriteContract();

  // Tunggu konfirmasi dari network setelah user klik "Confirm" di MetaMask
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSwap = (amount: string, path: string[]) => {
    if (!isConnected || !address) {
      alert("Konekin dompet dulu jirr!");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) return;

    // Eksekusi fungsi Swap (as any biar Vercel gak error pas build)
    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens' as any, 
      args: [
        parseUnits(amount, 18), // Amount In
        0,                      // Min Amount Out (Slippage 0)
        path,                   // Path [TokenA, TokenB]
        address,                // Penerima (User yang lagi konek)
        Math.floor(Date.now() / 1000) + 60 * 20 // Deadline 20 menit
      ],
    });
  };

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col overflow-hidden relative">
      {/* 1. NAVBAR */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. AREA KONTEN UTAMA */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        
        {/* SWAP TAB */}
        {activeTab === 'swap' && (
          <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-300">
            <SwapBox onSwap={handleSwap} isPending={isWalletPending || isConfirming} />
            
            {/* Notifikasi Transaksi (Opsional) */}
            {hash && (
              <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                {isConfirming ? (
                  <span className="text-yellow-500 animate-pulse">Processing...</span>
                ) : isSuccess ? (
                  <a href={`https://explorer.datahaven.com/tx/${hash}`} target="_blank" className="text-green-500 hover:underline">
                    Success! View Transaction
                  </a>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* TAB LAINNYA */}
        {activeTab === 'liquidity' && <div className="w-full max-w-2xl"><Liquidity /></div>}
        {activeTab === 'farm' && <div className="w-full max-w-4xl"><Farm /></div>}
        {activeTab === 'pools' && <div className="w-full max-w-4xl"><Pools /></div>}

      </div>
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-haven-pink/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-haven-purple/5 blur-[120px] rounded-full pointer-events-none"></div>
    </main>
  );
}