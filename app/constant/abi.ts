// app/constant/abi.ts

export const ROUTER_ABI = [
  // --- ADD LIQUIDITY ---
  {
    "name": "addLiquidityETH",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amountTokenDesired", "type": "uint256" },
      { "name": "amountTokenMin", "type": "uint256" },
      { "name": "amountETHMin", "type": "uint256" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "outputs": [
      { "name": "amountToken", "type": "uint256" },
      { "name": "amountETH", "type": "uint256" },
      { "name": "liquidity", "type": "uint256" }
    ]
  },
  // --- SWAP FUNCTIONS ---
  {
    "name": "swapExactETHForTokens",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "outputs": [{ "name": "amounts", "type": "uint256[]" }]
  },
  {
    "name": "swapExactTokensForETH",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "outputs": [{ "name": "amounts", "type": "uint256[]" }]
  }
] as const;

export const ERC20_ABI = [
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }
] as const;
