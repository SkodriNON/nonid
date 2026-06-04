export const NEXUS_TOKENS = [
  {
    symbol: "ETH",
    name: "Arbitrum Sepolia ETH",
    type: "native",
    decimals: 18,
    address: ""
  },
  {
    symbol: "USDT",
    name: "Test USDT",
    type: "erc20",
    decimals: 6,
    address:
      process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS || ""
  },
  {
    symbol: "NON",
    name: "SkodriNON",
    type: "erc20",
    decimals: 18,
    address:
      process.env.NEXT_PUBLIC_NON_TOKEN_ADDRESS || ""
  }
]