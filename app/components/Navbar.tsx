'use client';
import React from 'react';
import { Shield } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md border-b border-gray-800 fixed top-0 w-full z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Shield className="text-black w-5 h-5" fill="black" />
        </div>
        <div className="hidden sm:block">
          <span className="text-white font-black text-xl tracking-tighter uppercase italic">HAVEN </span>
          <span className="text-pink-500 font-black text-xl tracking-tighter uppercase italic">EXCHANGE</span>
        </div>
      </div>

      <div className="flex items-center bg-[#131313] border border-gray-800 rounded-full p-1">
        {['Swap', 'Liquidity'].map((item) => (
          <button key={item} className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all">
            {item}
          </button>
        ))}
      </div>

      <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={true} />
    </nav>
  );
};
export default Navbar;
