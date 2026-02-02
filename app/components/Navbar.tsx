'use client';
import React from 'react';

export default function Navbar({ activeTab, setActiveTab }: any) {
  return (
    <nav className="w-full border-b border-zinc-900 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO AREA */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Pakai div buat handle logo kalau file img lo masih pecah/hilang di w.PNG */}
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              H
            </div>
            <span className="text-white font-black italic tracking-tighter text-2xl group-hover:text-haven-pink transition-colors">
              HAVEN
            </span>
          </div>
          
          {/* NAVIGASI DATAR (Kunci biar gak scroll kayak di 77.PNG) */}
          <div className="hidden md:flex bg-[#0f0f0f] p-1 rounded-2xl border border-zinc-800/50 shadow-inner">
            {['swap', 'liquidity', 'pools', 'farm'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-7 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                  activeTab === t 
                  ? 'bg-zinc-800 text-haven-pink shadow-lg border border-zinc-700' 
                  : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* WALLET BUTTON (Posisi Pojok Kanan Atas) */}
        <div className="flex items-center gap-4">
           <div className="bg-[#0f0f0f] px-5 py-2.5 rounded-2xl border border-zinc-800 text-[11px] font-black text-white hover:border-haven-pink transition-all cursor-pointer flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              0xE4...D81f
           </div>
        </div>

      </div>
    </nav>
  );
}