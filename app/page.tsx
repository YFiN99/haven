'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';

import Navbar from './components/Navbar';
import SwapBox from './components/SwapBox';
import Liquidity from './components/Liquidity';
import Farm from './components/Farm';
import Pools from './components/Pools';
import { ROUTER_ADDRESS, WHT_ADDRESS } from './constant/tokenlist';
import { ROUTER_ABI, ERC20_ABI } from './constant/abi';

export default function Page() {
  const [activeTab, setActiveTab] = useState('swap');
  const { address, isConnected } = useAccount();

  const { writeContract, data: hash, isPending: isWalletPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // State untuk melacak token mana yang sedang diproses
  const [pendingPath, setPendingPath] = useState<string[]>([]);
  const [pendingAmount, setPendingAmount] = useState("");

  // Cek Izin Token (Hanya jika bukan Native HAV)
  const isSellingNative = pendingPath[0]?.toLowerCase() === WHT_ADDRESS.toLowerCase();
  
  const { data: allowance } = useReadContract({
    address: pendingPath[0] as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, ROUTER_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address && !!pendingPath[0] && !isSellingNative }
  });

  const handleSwap = async (amount: string, path: string[]) => {
    if (!isConnected || !address) return alert("Konekin dompet dulu jirr!");
    
    setPendingPath(path);
    setPendingAmount(amount);

    const amountIn = parseUnits(amount, 18);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
    const isNative = path[0].toLowerCase() === WHT_ADDRESS.toLowerCase();

    // 1. LOGIC JUAL NATIVE (HAV -> TOKEN)
    if (isNative) {
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [BigInt(0), path as any, address as any, deadline],
        value: amountIn, 
      });
    } 
    // 2. LOGIC JUAL TOKEN (TOKEN -> HAV)
    else {
      // Cek apakah butuh Approve
      if (!allowance || (allowance as bigint) < amountIn) {
        console.log("Minta izin dulu jirr...");
        writeContract({
          address: path[0] as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [ROUTER_ADDRESS as `0x${string}`, parseUnits("1000000000", 18)],
        });
        return;
      }

      // Kalau sudah di-approve, panggil swapExactTokensForETH
      writeContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [amountIn, BigInt(0), path as any, address as any, deadline],
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
                  {writeError.message.includes("User rejected") ? "Transaksi Dicancel" : "Gagal Jirr! Cek Saldo/Allowance"}
                </div>
              )}

              {hash && (
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                  {isConfirming ? (
                    <span className="text-yellow-500 animate-pulse">Wait a sec... Blockchain is cooking...</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-green-500">BERHASIL JIRR! 🔥</span>
                      <a href={`https://explorer.datahaven.com/tx/${hash}`} target="_blank" className="text-zinc-500 underline">Lihat di Explorer</a>
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
