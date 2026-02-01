'use client';
import React, { useState } from 'react';
import SwapBox from './components/SwapBox';
import Liquidity from './components/Liquidity';
import Pools from './components/Pools';
import Farm from './components/Farm';
import { Shield } from 'lucide-react'; // Pakai Shield biar makin gagah

export default function Home() {
  const [tab, setTab] = useState('Swap');

  return (
    <main className="min-h-screen bg-black text-white selection:bg-pink-500/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-pink-900/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar - SUDAH DIGANTI KE HAVEN */}
      <header className="flex items-center justify-between px-8 py-5 relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:rotate-6 transition-transform">
            <Shield className="text-black w-6 h-6" fill="black" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter uppercase italic text-white">
              Haven
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-pink-500">
              Exchange
            </span>
          </div>
        </div>

        {/* Tab Menu */}
        <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-gray-800">
          {['Swap', 'Liquidity', 'Pools', 'Farm'].map((item) => (
            <button 
              key={item} 
              onClick={() => setTab(item)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                tab === item ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Wallet Info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-2 items-center gap-2">
            <span className="text-xs font-black text-white italic">867.8 HAV</span>
          </div>
          <button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-pink-500/10">
            0xE4…D81f
          </button>
        </div>
      </header>

      {/* Content Render */}
      <div className="relative z-10 pt-8">
        {tab === 'Swap' && <SwapBox />}
        {tab === 'Liquidity' && <Liquidity />}
        {tab === 'Pools' && <Pools />}
        {tab === 'Farm' && <Farm />}
      </div>
    </main>
  );
}