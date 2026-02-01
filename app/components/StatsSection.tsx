import React from 'react';
import { Plus } from 'lucide-react';

const StatsSection = () => {
  return (
    <div className="mt-32 px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-2">Yield Farming</h1>
      <p className="text-gray-400 mb-10">Stake LP tokens to earn WOPN rewards</p>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {/* TVL Card */}
        <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Value Locked</p>
          <h2 className="text-4xl font-bold text-white mt-3">$0</h2>
        </div>

        {/* Staked Card */}
        <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Your Total Staked</p>
          <h2 className="text-4xl font-bold text-white mt-3">$0.00</h2>
        </div>

        {/* Rewards Card */}
        <div className="bg-[#111111]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Rewards</p>
          <h2 className="text-4xl font-bold text-purple-400 mt-3">0.0000 WOPN</h2>
        </div>
      </div>

      {/* No Farms State */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700 mb-6 shadow-2xl">
          <Plus className="text-purple-500 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No farms available</h3>
        <p className="text-gray-500">Check back later for farming opportunities</p>
      </div>
    </div>
  );
};

export default StatsSection;