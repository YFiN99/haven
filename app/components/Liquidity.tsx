'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Plus, Loader2, ChevronDown, X } from 'lucide-react';
import { ROUTER_ADDRESS, TOKEN_LIST, FACTORY_ADDRESS, WHT_ADDRESS } from '../constant/tokenlist';

// 1. SEMUA ABI DIKUMPULIN DI SINI
const FACTORY_ABI = [
  { "inputs": [{"name": "tokenA", "type": "address"},{"name": "tokenB", "type": "address"}], "name": "getPair", "outputs": [{"name": "pair", "type": "address"}], "stateMutability": "view", "type": "function" }
] as const;

const ROUTER_ABI = [
  { "inputs": [{"name": "token", "type": "address"},{"name": "amountTokenDesired", "type": "uint256"},{"name": "amountTokenMin", "type": "uint256"},{"name": "amountETHMin", "type": "uint256"},{"name": "to", "type": "address"},{"name": "deadline", "type": "uint256"}], "name": "addLiquidityETH", "outputs": [{"name": "amountToken", "type": "uint256"},{"name": "amountETH", "type": "uint256"},{"name": "liquidity", "type": "uint256"}], "stateMutability": "payable", "type": "function" },
  { "inputs": [{"name": "token", "type": "address"},{"name": "liquidity", "type": "uint256"},{"name": "amountTokenMin", "type": "uint256"},{"name": "amountETHMin", "type": "uint256"},{"name": "to", "type": "address"},{"name": "deadline", "type": "uint256"}], "name": "removeLiquidityETH", "outputs": [{"name": "amountToken", "type": "uint256"},{"name": "amountETH", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function" }
] as const;

const PAIR_ABI = [
  { "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "name": "owner", "type": "address" }, { "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }
] as const;

export default function Liquidity() {
  const { address, isConnected } = useAccount();
  const [amountHAV, setAmountHAV] = useState('');
  const [amountToken, setAmountToken] = useState('');
  const [tokenOut, setTokenOut] = useState(TOKEN_LIST[1]); // Default ke USDC
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removePercent, setRemovePercent] = useState(100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 2. DINAMIS: Cari alamat pair berdasarkan token yang dipilih (USDC atau DATA)
  const { data: pairAddress } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [WHT_ADDRESS as `0x${string}`, tokenOut.address as `0x${string}`],
    query: { enabled: mounted && !!tokenOut.address }
  });

  // 3. FETCH BALANCES
  const { data: havBalance, refetch: refHAV } = useBalance({ address, query: { enabled: mounted && !!address, refetchInterval: 5000 } });
  const { data: tokenBalance, refetch: refToken } = useBalance({ address, token: tokenOut.address as `0x${string}`, query: { enabled: mounted && !!address, refetchInterval: 5000 } });
  
  // 4. FETCH LP BALANCE (Buat nampilin "Your Position")
  const { data: lpBalance, refetch: refetchLP } = useReadContract({
    address: pairAddress as `0x${string}`, 
    abi: PAIR_ABI, 
    functionName: 'balanceOf', 
    args: address ? [address] : undefined,
    query: { enabled: !!pairAddress && !!address }
  });

  // 5. CHECK ALLOWANCE UNTUK TOKEN (DATA/USDC)
  const { data: allowanceToken, refetch: refAllowToken } = useReadContract({
    address: tokenOut.address as `0x${string}`, 
    abi: PAIR_ABI, 
    functionName: 'allowance', 
    args: [address!, ROUTER_ADDRESS],
    query: { enabled: !!address && !!tokenOut.address }
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) { refetchLP(); refHAV(); refToken(); refAllowToken(); setAmountHAV(''); setAmountToken(''); }
  }, [isSuccess]);

  // HANDLE ADD LIQUIDITY
  const handleAction = () => {
    if (!isConnected) return alert("Konek wallet dulu!");
    const valToken = parseUnits(amountToken || '0', tokenOut.decimals);
    const valHAV = parseUnits(amountHAV || '0', 18);

    // Approve token jika allowance kurang
    if (!allowanceToken || allowanceToken < valToken) {
      writeContract({
        address: tokenOut.address as `0x${string}`, abi: PAIR_ABI, functionName: 'approve',
        args: [ROUTER_ADDRESS, parseUnits('999999999999', tokenOut.decimals)],
      });
      return;
    }

    // Add Liquidity ETH (HAV)
    writeContract({
      address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'addLiquidityETH',
      args: [tokenOut.address as `0x${string}`, valToken, 0n, 0n, address!, BigInt(Math.floor(Date.now() / 1000) + 1200)],
      value: valHAV,
    });
  };

  // HANDLE REMOVE LIQUIDITY
  const handleRemove = () => {
    if (!lpBalance || lpBalance === 0n || !pairAddress) return;
    const amountToRemove = (lpBalance * BigInt(removePercent)) / 100n;

    // Approve LP Token dulu
    writeContract({
      address: pairAddress, abi: PAIR_ABI, functionName: 'approve',
      args: [ROUTER_ADDRESS, amountToRemove],
    }, {
      onSuccess: () => {
        // Remove Liquidity
        writeContract({
          address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'removeLiquidityETH',
          args: [tokenOut.address as `0x${string}`, amountToRemove, 0n, 0n, address!, BigInt(Math.floor(Date.now() / 1000) + 1200)],
        });
      }
    });
  };

  const formatCompact = (val: string | undefined, dec = 4) => {
    if (!val) return '0.00';
    return parseFloat(val).toLocaleString('en-US', { maximumFractionDigits: dec });
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-[460px] bg-[#0d0d0d] border border-gray-800 rounded-[30px] p-6 shadow-2xl">
        <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2 text-white">
          <Plus className="text-pink-500" /> Add Liquidity
        </h2>

        <div className="space-y-4 mb-6">
          {/* INPUT HAV */}
          <div className="bg-[#131313] p-4 rounded-2xl border border-gray-800">
            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
              <span>Input HAV</span>
              <span className="text-pink-500 font-black italic">Bal: {formatCompact(havBalance?.formatted)}</span>
            </div>
            <input type="number" placeholder="0.0" value={amountHAV} onChange={(e) => setAmountHAV(e.target.value)} className="bg-transparent text-2xl font-bold outline-none text-white w-full italic" />
          </div>

          {/* INPUT TOKEN (BISA PILIH) */}
          <div className="bg-[#131313] p-4 rounded-2xl border border-gray-800">
            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
              <span className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => setIsModalOpen(true)}>
                Input {tokenOut.symbol} <ChevronDown className="w-3 h-3" />
              </span>
              <span className="text-pink-500 font-black italic">Bal: {formatCompact(tokenBalance?.formatted, 2)}</span>
            </div>
            <input type="number" placeholder="0.0" value={amountToken} onChange={(e) => setAmountToken(e.target.value)} className="bg-transparent text-2xl font-bold outline-none text-white w-full italic" />
            <div className="text-[10px] text-gray-600 font-bold mt-2 cursor-pointer hover:text-white" onClick={() => setAmountToken(tokenBalance?.formatted || '')}>MAX {tokenOut.symbol}</div>
          </div>
        </div>

        <button onClick={handleAction} disabled={isConfirming} className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white font-black py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 uppercase italic text-sm active:scale-95 transition-transform">
          {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
          {!allowanceToken || allowanceToken < parseUnits(amountToken || '0', tokenOut.decimals) ? `Enable ${tokenOut.symbol}` : 'Supply Liquidity'}
        </button>

        {/* YOUR POSITION SECTION */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase italic text-gray-500">Your Position ({tokenOut.symbol})</h3>
            <span className="text-pink-500 text-[10px] font-black italic">
              {lpBalance && lpBalance > 0n ? formatCompact(formatUnits(lpBalance, 18), 6) : '0.00'} LP
            </span>
          </div>

          {pairAddress && lpBalance && lpBalance > 0n ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((p) => (
                  <button key={p} onClick={() => setRemovePercent(p)} className={`py-2 rounded-xl text-[10px] font-black border transition-colors ${removePercent === p ? 'bg-pink-600 border-pink-500 text-white' : 'bg-transparent border-gray-800 text-gray-500 hover:text-white'}`}>{p}%</button>
                ))}
              </div>
              <button onClick={handleRemove} className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black hover:bg-red-500 hover:text-white transition-all">
                Confirm Remove {removePercent}%
              </button>
            </div>
          ) : (
            <div className="text-center py-4 border border-dashed border-gray-800 rounded-2xl text-[10px] text-gray-700 uppercase font-black tracking-widest">
              No Position Found
            </div>
          )}
        </div>
      </div>

      {/* TOKEN SELECTOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[380px] bg-[#0d0d0d] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-900 text-white font-black uppercase italic">
              <span>Select Asset</span> 
              <X className="cursor-pointer hover:text-pink-500 transition-colors" onClick={() => setIsModalOpen(false)} />
            </div>
            <div className="max-h-[350px] overflow-y-auto p-2">
              {TOKEN_LIST.filter(t => t.symbol !== 'HAV').map((t, i) => (
                <div key={i} onClick={() => { setTokenOut(t); setIsModalOpen(false); }} className="flex items-center gap-4 p-4 hover:bg-[#131313] rounded-2xl cursor-pointer text-white group transition-colors">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{t.logo}</span>
                  <div className="font-black italic text-lg">{t.symbol}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}