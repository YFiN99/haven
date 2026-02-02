'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';

// Import Komponen & Constant
import Navbar from './components/Navbar';
import SwapBox from './components/SwapBox';
import Liquidity from './components/Liquidity';
import Farm from './components/Farm';
import Pools from './components/Pools';
import { ROUTER_ADDRESS, WHT_ADDRESS } from './constant/tokenlist';
import { ROUTER_ABI } from './constant/abi';

const ERC20_ABI = [
  { "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
] as const;

export default function Page() {
  const [activeTab, setActiveTab] = useState('swap');
  const { address, isConnected } = useAccount();

  const { writeContract, data: hash, isPending: isWalletPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSwap = async (amount: string, path: string[]) => {
    if (!isConnected || !address) return alert("Konekin dompet dulu!");
    
    const amountIn = parseUnits(amount, 18);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    // CEK: Apakah ini Swap dari Native HAV (WHT)?
    // Di Web3000, kalau lo swap HAV, dia pake fungsi swapExactETHForTokens
    const isNative = path[0].toLowerCase() === WHT_ADDRESS.toLowerCase();

    if (isNative) {
      console.log("Swapping Native HAV...");
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [BigInt(0), path as any, address as any, deadline],
        value: amountIn, // Uangnya dikirim di 'value'
      });
    } else {
      console.log("Swapping ERC20 Token...");
      // 1. Logic Approve Otomatis (Web3000 biasanya handle ini)
      // Buat ngetes, kita langsung panggil Swap. 
      // Kalau gagal, lo harus Approve token MOCK lo dulu manual di Explorer.
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          amountIn,
          BigInt(0),
          path as any,
          address as any,
          deadline
        ],
      });
    }
  };

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col overflow-hidden relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        {activeTab === 'swap' && (
          <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-300">
            <SwapBox onSwap={handleSwap} isPending={isWalletPending || isConfirming} />
            
            <div className="mt-4">
              {writeError && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-[10px] text-red-500 font-black uppercase text-center">
                  Error: {writeError.message.includes("allowance") ? "Please Approve Token First" : "Transaction Failed"}
                </div>
              )}

              {hash && (
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                  {isConfirming ? (
                    <span className="text-yellow-500 animate-pulse">Processing Swap...</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-green-500">Success! 🔥</span>
                      <a href={`https://explorer.datahaven.com/tx/${hash}`} target="_blank" className="text-zinc-500 underline">View Detail</a>
                    </div>
                  )}
                </div>
              )}
            </div>
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
