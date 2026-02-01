import React from 'react';
import { Shield } from 'lucide-react'; // Icon tameng buat vibe "Haven"

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-black border-b border-gray-800 fixed top-0 w-full z-50">
      {/* LOGO BARU: HAVEN EXCHANGE */}
      <div className="flex items-center gap-3 group cursor-pointer">
        {/* Icon Box */}
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:rotate-6 transition-transform">
          <Shield className="text-black w-6 h-6" fill="black" />
        </div>
        
        {/* Text Brand */}
        <div className="flex items-center gap-1.5">
          <span className="text-white font-black text-2xl tracking-tighter uppercase italic">
            Haven
          </span>
          <span className="text-pink-500 font-black text-2xl tracking-tighter uppercase italic">
            Exchange
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="hidden md:flex items-center bg-[#131313] border border-gray-800 rounded-full px-2 py-1">
        {['Swap', 'Liquidity', 'Pools', 'Farm'].map((item) => (
          <button
            key={item}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              item === 'Farm' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Wallet */}
      <button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-[0.1em] hover:opacity-90 transition-all shadow-lg shadow-pink-500/10">
        Connect Wallet
      </button>
    </nav>
  );
};

export default Navbar;