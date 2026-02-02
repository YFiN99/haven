'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { TOKEN_LIST, ROUTER_ADDRESS, WHT_ADDRESS } from '../constant/tokenlist';
import { ROUTER_ABI } from '../constant/abi';

type Props = {
  onSwap: (amt: string, path: string[]) => void;
  isPending: boolean;
};

export default function SwapBox({ onSwap, isPending }: Props) {
  const { address } = useAccount();

  const [sellToken, setSellToken] = useState(TOKEN_LIST[0]);
  const [buyToken, setBuyToken] = useState(TOKEN_LIST[1]);
  const [sellAmount, setSellAmount] = useState('');

  /* ================= BALANCE ================= */
  const { data: balance } = useBalance({
    address,
    token:
      sellToken.address.toLowerCase() === WHT_ADDRESS.toLowerCase()
        ? undefined
        : (sellToken.address as `0x${string}`),
  });

  /* ================= PATH (FIXED) ================= */
  const path = useMemo(() => {
    if (!sellToken || !buyToken) return [];
    if (sellToken.address === buyToken.address) return [];

    const sell = sellToken.address;
    const buy = buyToken.address;

    if (
      sell.toLowerCase() === WHT_ADDRESS.toLowerCase() ||
      buy.toLowerCase() === WHT_ADDRESS.toLowerCase()
    ) {
      return [sell, buy];
    }

    return [sell, WHT_ADDRESS, buy];
  }, [sellToken, buyToken]);

  /* ================= QUOTE ================= */
  const enabled =
    !!sellAmount &&
    Number(sellAmount) > 0 &&
    path.length >= 2 &&
    sellToken.symbol !== buyToken.symbol;

  const amountIn = enabled
    ? parseUnits(sellAmount, sellToken.decimals)
    : 0n;

  const { data: amountsOut, isLoading: isQuoteLoading } = useReadContract({
    address: ROUTER_ADDRESS as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [amountIn, path],
    query: {
      enabled,
      refetchInterval: 5000,
    },
  });

  /* ================= BUY AMOUNT ================= */
  const buyAmount = useMemo(() => {
    if (!amountsOut || amountsOut.length < 2) return '0';
    return formatUnits(
      amountsOut[amountsOut.length - 1],
      buyToken.decimals
    );
  }, [amountsOut, buyToken]);

  const buyAmountNum = Number(buyAmount);

  /* ================= DEBUG ================= */
  useEffect(() => {
    if (enabled) {
      console.log('[QUOTE]', {
        sell: sellToken.symbol,
        buy: buyToken.symbol,
        sellAmount,
        path,
      });
    }
  }, [enabled, sellAmount, path, sellToken, buyToken]);

  /* ================= ACTION ================= */
  const handleSwapClick = () => {
    if (!enabled) return;
    onSwap(sellAmount, path);
  };

  const isDisabled =
    isPending ||
    !enabled ||
    isQuoteLoading ||
    buyAmountNum <= 0;

  const buttonText = (() => {
    if (isPending) return 'SWAPPING...';
    if (isQuoteLoading) return 'GETTING QUOTE...';
    if (enabled && buyAmountNum <= 0) return 'INSUFFICIENT LIQUIDITY';
    return 'CONFIRM SWAP';
  })();

  return (
    <div className="w-full max-w-[480px] bg-[#0c0c0c] border border-zinc-800 rounded-[32px] p-8 shadow-2xl">

      {/* SELL */}
      <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800 mb-2">
        <div className="flex justify-between text-[10px] font-black text-zinc-600 mb-3">
          <span>You Sell</span>
          <span>
            Bal:{' '}
            {balance
              ? Number(formatUnits(balance.value, balance.decimals)).toFixed(4)
              : '0.00'}{' '}
            {sellToken.symbol}
          </span>
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="number"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            placeholder="0.0"
            className="bg-transparent text-4xl w-full text-white outline-none"
          />

          <select
            value={sellToken.symbol}
            onChange={(e) => {
              const t = TOKEN_LIST.find(x => x.symbol === e.target.value);
              if (t) {
                setSellToken(t);
                setSellAmount('');
              }
            }}
            className="bg-zinc-900 text-white px-3 py-2 rounded-xl"
          >
            {TOKEN_LIST.map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SWITCH */}
      <div className="flex justify-center my-2">
        <button
          onClick={() => {
            setSellToken(buyToken);
            setBuyToken(sellToken);
            setSellAmount('');
          }}
          className="p-2 bg-zinc-800 rounded-xl text-white"
        >
          ⇅
        </button>
      </div>

      {/* BUY */}
      <div className="bg-[#141414] p-6 rounded-[24px] border border-zinc-800 mb-6">
        <div className="flex justify-between text-[10px] font-black text-zinc-600 mb-3">
          <span>You Buy (Est.)</span>
          {isQuoteLoading && <span className="text-pink-500">Loading...</span>}
        </div>

        <div className="flex gap-4 items-center">
          <input
            readOnly
            value={buyAmountNum > 0 ? buyAmountNum.toFixed(6) : ''}
            placeholder="0.0"
            className="bg-transparent text-4xl w-full text-zinc-500 outline-none"
          />

          <select
            value={buyToken.symbol}
            onChange={(e) => {
              const t = TOKEN_LIST.find(x => x.symbol === e.target.value);
              if (t) {
                setBuyToken(t);
                setSellAmount('');
              }
            }}
            className="bg-zinc-900 text-white px-3 py-2 rounded-xl"
          >
            {TOKEN_LIST.map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSwapClick}
        disabled={isDisabled}
        className="w-full py-5 rounded-2xl font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50"
      >
        {buttonText}
      </button>
    </div>
  );
}
