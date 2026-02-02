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
import { ROUTER_ADDRESS } from './constant/tokenlist';
import { ROUTER_ABI } from './constant/abi';

// ABI Sederhana buat cek izin (Allowance) dan Approve
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
] as const;

export default function Page() {
  const [activeTab, setActiveTab] = useState('swap');
  const { address, isConnected } = useAccount();

  // Hook buat nembak contract (Swap & Approve pake ini)
  const { writeContract, data: hash, isPending: isWalletPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // State buat nyimpen data swap dari SwapBox
  const [swapData, setSwapData] = useState<{amount: string, path: string[]} | null>(null);

  // 1. CEK ALLOWANCE (Apakah token udah di-approve?)
  // Kita cek token pertama di path (token yang mau dijual)
  const { data: allowance, refetch: checkAllowance } = useReadContract({
    address: swapData?.path[0] as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && ROUTER_ADDRESS ? [address, ROUTER_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address && !!swapData }
  });

  // 2. LOGIC APPROVE
  const handleApprove = () => {
    if (!swapData) return;
    writeContract({
      address: swapData.path[0] as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ROUTER_ADDRESS as `0x${string}`, parseUnits("1000000000", 18)], // Approve jumlah gede sekalian
    });
  };

  // 3. LOGIC SWAP
  const handleSwap = (amount: string, path: string[]) => {
    if (!isConnected || !address) {
      alert("Konekin dompet dulu jirr!");
      return;
    }
    
    // Simpan data buat pengecekan allowance
    setSwapData({ amount, path });

    // Kalau allowance kurang dari jumlah yang mau di-swap, harus approve dulu
    const amountIn = parseUnits(amount, 18);
    if (!allowance || (allowance as bigint) < amountIn) {
      handleApprove();
      return;
    }

    // Kalau sudah di-approve, gass Swap!
    writeContract({
      address: ROUTER_ADDRESS as `0x${string}`,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForTokens' as any, 
      args: [
        amountIn,         
        BigInt(0),                      
        path as any,                    
        address as any,                 
        BigInt(Math.floor(Date.now() / 1000) + 60 * 20) 
      ],
    });
  };

  // Refresh allowance otomatis kalau abis approve sukses
  useEffect(() => {
    if (isSuccess) checkAllowance();
  }, [isSuccess]);

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col overflow-hidden relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        {activeTab === 'swap' && (
          <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-300">
            <SwapBox 
              onSwap={handleSwap} 
              isPending={isWalletPending || isConfirming} 
            />
            
            {/* NOTIFIKASI STATUS */}
            <div className="mt-4">
              {writeError && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-[10px] text-red-500 font-black uppercase text-center">
                  Error: {writeError.message.split('\n')[0]}
                </div>
              )}

              {hash && (
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                  {isConfirming ? (
                    <span className="text-yellow-500 animate-pulse">Confirming Transaction...</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-green-500 font-bold">Transaction Success! 🔥</span>
                      <a href={`https://explorer.datahaven.com/tx/${hash}`} target="_blank" className="text-zinc-500 underline text-[9px]">View on Explorer</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB LAIN */}
        {activeTab === 'liquidity' && <div className="w-full max-w-2xl"><Liquidity /></div>}
        {activeTab === 'farm' && <div className="w-full max-w-4xl"><Farm /></div>}
        {activeTab === 'pools' && <div className="w-full max-w-4xl"><Pools /></div>}
      </div>
      
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-haven-pink/5 blur-[120px] rounded-full pointer-events-none"></div>
    </main>
  );
}
