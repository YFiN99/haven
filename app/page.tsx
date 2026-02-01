'use client';
import React, { useState } from 'react';
import SwapBox from './components/SwapBox';
import Liquidity from './components/Liquidity';
import Pools from './components/Pools';
import Farm from './components/Farm';

export default function Home() {
  const [tab, setTab] = useState('Swap');

  return (
    <main className="w-full max-w-[480px] px-4 mx-auto pt-10">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-pink-900/5 rounded-full blur-[100px]" />
      </div>

      {/* HAPUS BAGIAN "Tab Menu Tengah" DI SINI JIRR! */}

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