export const DATAHAVEN_CONFIG = {
  WETH: "0xc9c4B7DF500336A24F46671287Ccde5A674A3FB2",
  FACTORY: "0x793738CD083fe56b655DAF38371B930a6c234609",
  ROUTER: "0x34882E4B2E92b87A78bf9A46Ea345bA5B7613ab2",
  USDC: "0xBaFA49876219FD3b5BFb361FD7Ee3044Fbc576Ac",
  INIT_CODE_HASH: "0x494fbc9e5b1973dd14b0dbd9996ce35a7005d39519137220de8dd017d4e5cbcd",
  FEE_SETTER: "0xE4CE700d2a32D635ba490384FA788554f8aCD81f"
};

// Tambahin ini biar SwapBox bisa import langsung jirr!
export const ROUTER_ADDRESS = DATAHAVEN_CONFIG.ROUTER;
export const WETH_ADDRESS = DATAHAVEN_CONFIG.WETH;
export const TOKEN_ADDRESS = DATAHAVEN_CONFIG.USDC;

// WAJIB: Tambahin ABI-nya di sini karena Vercel tadi komplain ROUTER_ABI missing!
export const ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
] as const;