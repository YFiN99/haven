'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { Zap, Loader2, Wallet, ArrowUpRight } from 'lucide-react';

// KONFIGURASI DARI .ENV
const REVENUE_SHARE_ADDR = process.env.NEXT_PUBLIC_REVENUE_SHARE as `0x${string}`;
const DATA_TOKEN_ADDR = process.env.NEXT_PUBLIC_DATA as `0x${string}`;
const LP_TOKEN_ADDR = '0x55557eDD8D079eF87B08A7c6ebd718849BAcCCDF' as `0x${string}`;

// ABI KONTRAK BARU (HavenFarm.sol)
const FARM_ABI = [
  { "inputs": [{"name": "amount", "type": "uint256"}], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name": "amount", "type": "uint256"}], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"name": "account", "type": "address"}], "name": "earned", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" }
] as const;

const ERC20_ABI = [
  { "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}], "name": "allowance", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function" }
] as const;

export default function Farm() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 1. DATA READ
  const { data: lpBalance, refetch: refetchLP } = useBalance({ 
    address, 
    token: LP_TOKEN_ADDR,
    query: { enabled: !!address } 
  });
  
  const { data: pendingReward, refetch: refetchPending } = useReadContract({
    address: REVENUE_SHARE_ADDR, 
    abi: FARM_ABI, 
    functionName: 'earned', // Di kontrak baru namanya 'earned'
    args: [address!], 
    query: { enabled: !!address, refetchInterval: 3000 }
  });

  const { data: stakedAmount, refetch: refetchStaked } = useReadContract({
    address: REVENUE_SHARE_ADDR, 
    abi: FARM_ABI, 
    functionName: 'balanceOf', // Di kontrak baru namanya 'balanceOf'
    args: [address!], 
    query: { enabled: !!address }
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: LP_TOKEN_ADDR, 
    abi: ERC20_ABI, 
    functionName: 'allowance', 
    args: [address!, REVENUE_SHARE_ADDR], 
    query: { enabled: !!address }
  });

  // 2. TRANSACTIONS
  const { writeContract, data: hash, isPending: isBroadcasting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchPending(); refetchStaked(); refetchAllowance(); refetchLP();
      setAmount('');
    }
  }, [isSuccess]);

  const displayReward = useMemo(() => {
    if (!pendingReward) return '0.000000';
    return parseFloat(formatUnits(pendingReward, 18)).toFixed(6);
  }, [pendingReward]);

  const handleAction = () => {
    if (!amount || isNaN(Number(amount))) return;
    const parsedAmount = parseUnits(amount, 18);

    if (activeTab === 'stake') {
      if ((allowance || 0n) < parsedAmount) {
        writeContract({ address: LP_TOKEN_ADDR, abi: ERC20_ABI, functionName: 'approve', args: [REVENUE_SHARE_ADDR, parseUnits('999999999', 18)] });
      } else {
        writeContract({ address: REVENUE_SHARE_ADDR, abi: FARM_ABI, functionName: 'stake', args: [parsedAmount] });
      }
    } else {
      writeContract({ address: REVENUE_SHARE_ADDR, abi: FARM_ABI, functionName: 'withdraw', args: [parsedAmount] });
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-black text-white font-sans uppercase italic">
      <div className="w-full max-w-[440px] bg-[#0d0d0d] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_50px_-10px_rgba(34,197,94,0.3)]">
        
        {/* REWARD CARD */}
        <div className="p-8 bg-gradient-to-b from-green-500/20 to-transparent">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                HAVEN FARM <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </h2>
              <p className="text-[9px] text-gray-500 tracking-[0.3em]">REVENUE SHARE ACTIVE</p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
            <p className="text-[10px] text-green-500 font-black mb-1">DATA EARNED</p>
            <div className="flex justify-between items-end">
              <h3 className="text-4xl font-black tabular-nums">{displayReward}</h3>
              <button 
                onClick={() => writeContract({ address: REVENUE_SHARE_ADDR, abi: FARM_ABI, functionName: 'claim' })}
                disabled={!pendingReward || pendingReward === 0n || isConfirming}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-20 px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-green-900/20"
              >
                HARVEST
              </button>
            </div>
          </div>
        </div>

        {/* STAKE CONTROL */}
        <div className="p-8 pt-0 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('stake')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'stake' ? 'bg-white text-black' : 'text-gray-500'}`}>STAKE LP</button>
            <button onClick={() => setActiveTab('unstake')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${activeTab === 'unstake' ? 'bg-white text-black' : 'text-gray-500'}`}>UNSTAKE</button>
          </div>

          <div className="bg-white/5 p-6 rounded-[30px] border border-white/5">
            <div className="flex justify-between text-[9px] text-gray-500 mb-4">
              <span>{activeTab === 'stake' ? 'WALLET' : 'STAKED'}</span>
              <span className="text-white cursor-pointer hover:text-green-500" onClick={() => setAmount(activeTab === 'stake' ? (lpBalance?.formatted || '0') : formatUnits(stakedAmount || 0n, 18))}>
                {activeTab === 'stake' ? Number(lpBalance?.formatted || 0).toFixed(6) : Number(formatUnits(stakedAmount || 0n, 18)).toFixed(6)} LP
              </span>
            </div>
            <input 
              type="number" placeholder="0.0" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-4xl font-black outline-none w-full placeholder:text-gray-800" 
            />
          </div>

          <button 
            onClick={handleAction}
            disabled={!isConnected || isConfirming || isBroadcasting || !amount}
            className="w-full bg-white text-black font-black py-5 rounded-[24px] text-xs hover:bg-green-500 hover:text-white transition-all disabled:opacity-10 shadow-xl flex justify-center items-center gap-3"
          >
            {(isConfirming || isBroadcasting) && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isConnected ? 'CONNECT' : 
             (activeTab === 'stake' && (allowance || 0n) < parseUnits(amount || '0', 18)) ? 'APPROVE LP' : 
             activeTab === 'stake' ? 'STAKE LP' : 'UNSTAKE LP'}
          </button>

          <a href="/liquidity" className="flex items-center justify-center gap-2 text-gray-600 text-[9px] hover:text-white transition-all tracking-widest">
            GET LP TOKEN <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}