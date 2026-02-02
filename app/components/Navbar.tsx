'use client';
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar({ activeTab, setActiveTab }: any) {
  return (
    <nav className="w-full border-b border-zinc-900 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-black text-black text-xl">H</div>
            <span className="text-white font-black italic tracking-tighter text-2xl">HAVEN</span>
          </div>
          
          <div className="hidden md:flex bg-[#0f0f0f] p-1 rounded-2xl border border-zinc-800/50">
            {['swap', 'liquidity', 'pools', 'farm'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-7 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  activeTab === t ? 'bg-zinc-800 text-haven-pink' : 'text-zinc-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* INI BARU DOMPET BENERAN JIRR */}
        <ConnectButton 
          accountStatus="address" 
          showBalance={false} 
          chainStatus="icon"
        />
      </div>
    </nav>
  );
}