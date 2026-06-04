export const ENV = {
  GENESIS_CONTRACT:
    process.env.NEXT_PUBLIC_GENESIS_CONTRACT ||
    process.env.NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS ||
    "",

  ARBITRUM_RPC:
    process.env.NEXT_PUBLIC_ARBITRUM_RPC ||
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC ||
    process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ||
    "",

  USDT_TOKEN:
    process.env.NEXT_PUBLIC_USDT_TOKEN ||
    process.env.NEXT_PUBLIC_USDT_ADDRESS ||
    process.env.NEXT_PUBLIC_MOCK_USDT ||
    "",

  USDT_DECIMALS:
    Number(
      process.env.NEXT_PUBLIC_USDT_DECIMALS ||
      "6"
    ),

  NETWORK_NAME:
    process.env.NEXT_PUBLIC_NETWORK_NAME ||
    "Network",

  CHAIN_ID:
    process.env.NEXT_PUBLIC_CHAIN_ID ||
    "",

  BLOCK_EXPLORER:
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER ||
    ""
}