'use client';
import React, { useState } from 'react';

// 1. PANGGIL SEMUA KOMPONEN DARI DIR LO JIRRR
import Navbar from './components/Navbar';
import SwapBox from './components/SwapBox';
import Liquidity from './components/Liquidity';
import Farm from './components/Farm';
import Pools from './components/Pools';

export default function Page() {
  // State buat nentuin menu mana yang aktif (Default: Swap)
  const [activeTab, setActiveTab] = useState('swap');
  
  // Logic dummy biar SwapBox gak error TypeScript (WAJIB ADA JIRR)
  const handleSwap = (amount: string, path: string[]) => {
    console.log("Memulai swap:", amount, path);
  };

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
      {/* 2. NAVBAR: Kirim state ke sini biar navigasi bisa di atas */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 3. AREA KONTEN UTAMA: Cuma satu yang tampil di tengah */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        
        {/* SWAP TAB - Sekarang udah dikasih props biar gak error build */}
        {activeTab === 'swap' && (
          <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-300">
            <SwapBox onSwap={handleSwap} isPending={false} />
          </div>
        )}

        {/* LIQUIDITY TAB */}
        {activeTab === 'liquidity' && (
          <div className="w-full max-w-2xl animate-in fade-in duration-300">
            <Liquidity />
          </div>
        )}

        {/* FARM TAB */}
        {activeTab === 'farm' && (
          <div className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300">
            <Farm />
          </div>
        )}

        {/* POOLS TAB */}
        {activeTab === 'pools' && (
          <div className="w-full max-w-4xl animate-in fade-in duration-300">
            <Pools />
          </div>
        )}

      </div>
      
      {/* Background Decor (Opsional biar Gak Sepi) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-haven-pink/10 blur-[120px] rounded-full pointer-events-none"></div>
    </main>
  );
}