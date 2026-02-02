'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// Import Komponen & Constant
import Navbar from './components/Navbar';
import SwapBox from './components/SwapBox';
import { ROUTER_ADDRESS } from './constant/tokenlist';
import { ROUTER_ABI } from './constant/abi';

export default function Page() {
  const [activeTab, setActiveTab] = useState('swap');
  const { address, isConnected } = useAccount();

  // 1. Setup Hook Write Contract
  const { 
    writeContract, 
    data: hash, 
    isPending: isWalletPending, 
    error: writeError 
  } = useWriteContract();

  // 2. Monitoring status transaksi
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // 3. Log Error kalau ada masalah biar keliatan di layar
  useEffect(() => {
    if (writeError) {
      console.error("Wagmi Error:", writeError);
    }
  }, [writeError]);

  const handleSwap = (amount: string, path: string[]) => {
    console.log("Klik Swap: ", { amount, path, router: ROUTER_ADDRESS });

    if (!isConnected || !address) {
      alert("Konekin dompet dulu jirr!");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) return;

    // Pastiin Router Address kebaca dari env
    if (!ROUTER_ADDRESS) {
      alert("Alamat Router ilang jirr, cek .env lo!");
      return;
    }

    try {
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens' as any, 
        args: [
          parseUnits(amount, 18),         
          BigInt(0),                      
          path as `0x${string}`[],        
          address as `0x${string}`,       
          BigInt(Math.floor(Date.now() / 1000) + 60 * 20) 
        ],
      });
    } catch (e) {
      console.error("Execution Error:", e);
    }
  };

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col overflow-hidden relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        {activeTab === 'swap' && (
          <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-300">
            <SwapBox onSwap={handleSwap} isPending={isWalletPending || isConfirming} />
            
            {/* ALERT ERROR BIAR LO TAU KENAPA GAK POP-UP */}
            {writeError && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-xl text-[10px] text-red-400 font-black uppercase text-center">
                Error: {writeError.message.slice(0, 100)}...
              </div>
            )}

            {hash && (
              <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                {isConfirming ? (
                  <span className="text-yellow-500 animate-pulse">Confirming in Wallet...</span>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-green-500">Transaction Sent!</span>
                    <a href={`https://explorer.datahaven.com/tx/${hash}`} target="_blank" className="text-zinc-500 underline">View</a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Placeholder tab lain */}
        {activeTab !== 'swap' && <div className="text-zinc-500 font-black italic uppercase">Tab {activeTab} is Under Construction</div>}
      </div>
      
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-haven-pink/5 blur-[120px] rounded-full pointer-events-none"></div>
    </main>
  );
}
