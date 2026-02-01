'use client';
import React, { useState } from 'react';
import SwapBox from './components/SwapBox';
import Liquidity from './components/Liquidity';
import Pools from './components/Pools';
import Farm from './components/Farm';

export default function Home() {
  const [tab, setTab] = useState('Swap');

  return (
    <main className="w-full max-w-[480px] px-4">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-pink-900/5 rounded-full blur-[100px]" />
      </div>

      {/* Tab Menu Tengah */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-gray-800">
          {['Swap', 'Liquidity', 'Pools', 'Farm'].map((item) => (
            <button 
              key={item} 
              onClick={() => setTab(item)}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                tab === item ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Content Render */}
      <div className="relative z-10">
        {tab === 'Swap' && <SwapBox />}
        {tab === 'Liquidity' && <Liquidity />}
        {tab === 'Pools' && <Pools />}
        {tab === 'Farm' && <Farm />}
      </div>
    </main>
  );
}
