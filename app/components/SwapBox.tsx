'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
// Ganti path ini sesuai lokasi file abi/address lu
import { ROUTER_ADDRESS, ROUTER_ABI, WETH_ADDRESS, TOKEN_ADDRESS } from '../constants';

export default function SwapBox() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const { writeContract, isPending } = useWriteContract();

  const handleSwap = async () => {
    if (!isConnected) return alert("Konek wallet dulu jirr!");
    if (!amount || parseFloat(amount) <= 0) return alert("Isi jumlahnya!");

    try {
      writeContract({
        address: ROUTER_ADDRESS, // Pake alamat router asli lu!
        abi: ROUTER_ABI,         // Pake ABI router asli lu!
        functionName: 'swapExactETHForTokens', // Karena inputnya native HAV
        args: [
          BigInt(0), // amountOutMin (0 buat tes doang)
          [WETH_ADDRESS, TOKEN_ADDRESS], // Path swap
          address, // Penerima (wallet lu)
          BigInt(Math.floor(Date.now() / 1000) + 600), // Deadline 10 menit
        ],
        value: parseEther(amount), // Nilai HAV yang di-swap
      });
    } catch (e) {
      console.error("Gagal total:", e);
    }
  };

  return (
    // ... UI lu yang tadi udah cakep ...
    <button onClick={handleSwap} disabled={isPending}>
      {isPending ? 'SABAR JIRR...' : 'SWAP SEKARANG!'}
    </button>
  );
}