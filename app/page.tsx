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

  const { writeContract, data: hash, isPending: isWalletPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSwap = (amount: string, path: string[]) => {
    if (!isConnected || !address) {
      alert("Konekin dompet dulu jirr!");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) return;

    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens' as any, 
      args: [
        parseUnits(amount, 18),         
        BigInt(0),                      
        path as any,                    // <--- PAKSA 'as any' BIAR GAK ERROR 0x${string}
        address as any,                 // <--- PAKSA 'as any' JUGA JIRR
        BigInt(Math.floor(Date.now() / 1000) + 60 * 20) 
      ],
    });
  };

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col overflow-hidden relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        {activeTab === 'swap' && (
          <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-300">
            <SwapBox onSwap={handleSwap} isPending={isWalletPending || isConfirming} />
            
            {hash && (
              <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                {isConfirming ? (
                  <span className="text-yellow-500 animate-pulse">Processing...</span>
                ) : isSuccess ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-green-500">Success!</span>
                    <a href={`https://explorer.datahaven.com/tx/${hash}`} target="_blank" className="text-zinc-500 hover:text-white underline transition-all">
                      View on Explorer
                    </a>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liquidity' && <div className="w-full max-w-2xl"><Liquidity /></div>}
        {activeTab === 'farm' && <div className="w-full max-w-4xl"><Farm /></div>}
        {activeTab === 'pools' && <div className="w-full max-w-4xl"><Pools /></div>}
      </div>
      
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-haven-pink/5 blur-[120px] rounded-full pointer-events-none"></div>
    </main>
  );
}
