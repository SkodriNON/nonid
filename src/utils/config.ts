export const CONFIG = {

  APP_NAME:
    process.env
      .NEXT_PUBLIC_APP_NAME || "",

  APP_DESCRIPTION:
    process.env
      .NEXT_PUBLIC_APP_DESCRIPTION || "",

  NETWORK:
    process.env
      .NEXT_PUBLIC_NETWORK || "",

  CHAIN_ID:
    process.env
      .NEXT_PUBLIC_CHAIN_ID || "",

  RPC_URL:
    process.env
      .NEXT_PUBLIC_RPC_URL || "",

  MAINNET_RPC:
    process.env
      .NEXT_PUBLIC_MAINNET_RPC || "",

  CONTRACT_ADDRESS:
    process.env
      .NEXT_PUBLIC_CONTRACT_ADDRESS || "",

  API_URL:
    process.env
      .NEXT_PUBLIC_API_URL || "",

  APP_VERSION:
    process.env
      .NEXT_PUBLIC_APP_VERSION || "",

  ENVIRONMENT:
    process.env
      .NEXT_PUBLIC_ENVIRONMENT || ""
}