'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useBalance, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatUnits, parseUnits } from 'viem';
import { ArrowDown, Settings, ChevronDown, Search, X, AlertCircle, Loader2 } from 'lucide-react';

import { TOKEN_LIST, ROUTER_ADDRESS, WHT_ADDRESS } from '../constant/tokenlist';

const ROUTER_ABI = [
  { "inputs": [ { "name": "amountOutMin", "type": "uint256" }, { "name": "path", "type": "address[]" }, { "name": "to", "type": "address" }, { "name": "deadline", "type": "uint256" } ], "name": "swapExactETHForTokens", "outputs": [ { "name": "amounts", "type": "uint256[]" } ], "stateMutability": "payable", "type": "function" },
  { "inputs": [ { "name": "amountIn", "type": "uint256" }, { "name": "amountOutMin", "type": "uint256" }, { "name": "path", "type": "address[]" }, { "name": "to", "type": "address" }, { "name": "deadline", "type": "uint256" } ], "name": "swapExactTokensForETH", "outputs": [ { "name": "amounts", "type": "uint256[]" } ], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "name": "amountIn", "type": "uint256" }, { "name": "amountOutMin", "type": "uint256" }, { "name": "path", "type": "address[]" }, { "name": "to", "type": "address" }, { "name": "deadline", "type": "uint256" } ], "name": "swapExactTokensForTokens", "outputs": [ { "name": "amounts", "type": "uint256[]" } ], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "name": "amountIn", "type": "uint256" }, { "name": "path", "type": "address[]" } ], "name": "getAmountsOut", "outputs": [ { "name": "amounts", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }
] as const;

const ERC20_ABI = [
  { "inputs": [ { "name": "owner", "type": "address" }, { "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }
] as const;

export default function SwapBox() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract } = useWriteContract();
  
  const [amount, setAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSide, setActiveSide] = useState<'in' | 'out'>('in');
  const [tokenIn, setTokenIn] = useState(TOKEN_LIST[0]); 
  const [tokenOut, setTokenOut] = useState(TOKEN_LIST[2]);

  const { data: balIn, refetch: refIn } = useBalance({ 
    address, 
    token: tokenIn.address || undefined,
    query: { refetchInterval: 5000 } 
  });
  const { data: balOut, refetch: refOut } = useBalance({ 
    address, 
    token: tokenOut.address || undefined,
    query: { refetchInterval: 5000 }
  });

  const { data: allowance, refetch: refAllow } = useReadContract({
    address: tokenIn.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, ROUTER_ADDRESS],
    query: { enabled: !!address && !!tokenIn.address }
  });

  const { data: amountsOut } = useReadContract({
    address: ROUTER_ADDRESS,
    abi: ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: amount && parseFloat(amount) > 0 ? [
      parseUnits(amount, tokenIn.decimals),
      [tokenIn.address || WHT_ADDRESS, tokenOut.address || WHT_ADDRESS] as `0x${string}`[]
    ] : undefined,
    query: { enabled: !!amount && parseFloat(amount) > 0 }
  });

  const outputValue = amountsOut ? formatUnits(amountsOut[1], tokenOut.decimals) : '';
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refIn(); refOut(); refAllow();
      setAmount('');
    }
  }, [isSuccess]);

  // Helper Formatter buat ngehindarin 1e+28
  const formatBalance = (val: string | undefined) => {
    if (!val) return '0.00';
    return parseFloat(val).toLocaleString('en-US', { 
      maximumFractionDigits: 4,
      useGrouping: true 
    });
  };

  const handleAction = () => {
    if (!isConnected) return alert("Konek wallet dulu jirr!");
    const amountIn = parseUnits(amount, tokenIn.decimals);
    const path = [tokenIn.address || WHT_ADDRESS, tokenOut.address || WHT_ADDRESS] as `0x${string}`[];
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

    if (tokenIn.address && (!allowance || allowance < amountIn)) {
      writeContract({
        address: tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ROUTER_ADDRESS, parseUnits('999999999999', tokenIn.decimals)],
      });
      return;
    }

    if (tokenIn.symbol === 'HAV') {
      writeContract({ address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'swapExactETHForTokens', args: [BigInt(0), path, address!, deadline], value: amountIn });
    } else if (tokenOut.symbol === 'HAV') {
      writeContract({ address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'swapExactTokensForETH', args: [amountIn, BigInt(0), path, address!, deadline] });
    } else {
      writeContract({ address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'swapExactTokensForTokens', args: [amountIn, BigInt(0), path, address!, deadline] });
    }
  };

  const filteredTokens = TOKEN_LIST.filter(t => t.symbol.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[460px] bg-[#0d0d0d] border border-gray-800 rounded-[30px] p-2 shadow-2xl">
        <div className="flex justify-between items-center p-4">
          <div className="flex gap-4 font-black uppercase italic tracking-tighter text-white">
            <span className="border-b-2 border-pink-500 pb-1">Haven Swap</span>
          </div>
          <Settings className="w-5 h-5 text-gray-500 cursor-pointer hover:rotate-90 transition-all" />
        </div>

        {/* INPUT IN */}
        <div className="bg-[#131313] p-5 rounded-2xl mb-1 border border-gray-900">
          <div className="flex justify-between items-center">
            <input type="number" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent text-4xl outline-none text-white w-full font-bold italic" />
            <button onClick={() => { setActiveSide('in'); setIsModalOpen(true); }} className="bg-[#1a1a1a] flex items-center gap-2 px-4 py-2 rounded-full text-white font-black border border-gray-800">
              <span className="text-xl">{tokenIn.logo}</span> {tokenIn.symbol} <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="text-[11px] text-gray-500 font-bold mt-2 uppercase tracking-widest">
            Balance: <span className="text-pink-500">{formatBalance(balIn?.formatted)}</span>
          </div>
        </div>

        {/* SWITCH */}
        <div className="flex justify-center -my-4 relative z-10">
          <div onClick={() => { setTokenIn(tokenOut); setTokenOut(tokenIn); }} className="bg-[#1a1a1a] p-2 rounded-xl border border-gray-800 cursor-pointer hover:scale-110 transition-all">
            <ArrowDown className="text-pink-500 w-4 h-4" />
          </div>
        </div>

        {/* INPUT OUT */}
        <div className="bg-[#131313] p-5 rounded-2xl mt-1 border border-gray-900">
          <div className="flex justify-between items-center">
            <input 
              readOnly 
              placeholder="0.0" 
              value={outputValue ? parseFloat(outputValue).toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 6 }) : ''} 
              className="bg-transparent text-4xl outline-none text-gray-500 w-full font-bold italic" 
            />
            <button onClick={() => { setActiveSide('out'); setIsModalOpen(true); }} className="bg-gradient-to-r from-pink-600 to-purple-700 flex items-center gap-2 px-4 py-2 rounded-full text-white font-black border border-white/10">
              <span className="text-xl">{tokenOut.logo}</span> {tokenOut.symbol} <ChevronDown className="w-4 h-4 text-white/70" />
            </button>
          </div>
          <div className="text-[11px] text-gray-500 font-bold mt-2 uppercase tracking-widest">
            Balance: <span className="text-gray-300">{formatBalance(balOut?.formatted)}</span>
          </div>
        </div>

        {/* BUTTON ACTION */}
        <button onClick={handleAction} disabled={isConfirming || !amount} className="w-full mt-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white font-black py-5 rounded-[20px] shadow-lg active:scale-95 disabled:opacity-30 uppercase tracking-[0.2em] italic text-sm flex justify-center items-center gap-2">
          {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
          {tokenIn.address && (!allowance || allowance < parseUnits(amount || '0', tokenIn.decimals)) ? 'Enable ' + tokenIn.symbol : 'Swap Assets Now'}
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[420px] bg-[#0d0d0d] border border-gray-800 rounded-[32px] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-900 text-white font-black uppercase italic tracking-tighter">
              <span>Select Asset</span> <X className="cursor-pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            <div className="p-4"><input placeholder="Search..." className="w-full bg-[#131313] border border-gray-800 rounded-2xl py-3 px-4 text-white outline-none italic" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredTokens.map((t, i) => (
                <div key={i} onClick={() => { if (activeSide === 'in') setTokenIn(t); else setTokenOut(t); setIsModalOpen(false); }} className="flex items-center gap-4 p-4 hover:bg-[#131313] rounded-2xl cursor-pointer text-white group">
                  <span className="text-2xl">{t.logo}</span>
                  <div className="font-black italic">{t.symbol} <span className="block text-[9px] text-gray-500 uppercase not-italic font-bold">{t.name}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}