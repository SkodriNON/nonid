import { NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export const dynamic = "force-dynamic"

const CHAIN_ID = 421614
const NETWORK = "Arbitrum Sepolia"
const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc"

const USDT_TOKEN =
  process.env.NEXT_PUBLIC_USDT_TOKEN ||
  "0x8556Be98Bb21B1FE2Bc50EF0204ebFC73cC14897"

const USDT_DECIMALS =
  Number(process.env.NEXT_PUBLIC_USDT_DECIMALS || "6")

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
}

export async function GET(req: NextRequest) {
  try {
    const wallet =
      req.nextUrl.searchParams.get("address") || ""

    if (!ethers.utils.isAddress(wallet)) {
      return jsonError("Invalid wallet address")
    }

    const provider =
      new ethers.providers.StaticJsonRpcProvider(
        RPC_URL,
        {
          chainId: CHAIN_ID,
          name: "arbitrum-sepolia",
        }
      )

    const nativeRaw =
      await provider.getBalance(wallet)

    const native = {
      type: "native",
      name: "Arbitrum Sepolia Native Gas",
      symbol: "ETH",
      contractAddress: "native",
      decimals: 18,
      rawBalance: nativeRaw.toString(),
      balance: ethers.utils.formatEther(nativeRaw),
    }

    const tokenContract =
      new ethers.Contract(
        USDT_TOKEN,
        ERC20_ABI,
        provider
      )

    const [
      tokenRaw,
      tokenName,
      tokenSymbol,
      tokenDecimals,
    ] =
      await Promise.all([
        tokenContract.balanceOf(wallet),
        tokenContract.name().catch(() => "Mock USDT"),
        tokenContract.symbol().catch(() => "mUSDT"),
        tokenContract.decimals().catch(() => USDT_DECIMALS),
      ])

    const tokens =
      tokenRaw.isZero()
        ? []
        : [
            {
              type: "erc20",
              name: String(tokenName),
              symbol: String(tokenSymbol),
              contractAddress: USDT_TOKEN,
              decimals: Number(tokenDecimals),
              rawBalance: tokenRaw.toString(),
              balance: ethers.utils.formatUnits(
                tokenRaw,
                Number(tokenDecimals)
              ),
            },
          ]

    const holdings = [
      native,
      ...tokens,
    ]

    return NextResponse.json({
      success: true,
      wallet,
      chainId: CHAIN_ID,
      network: NETWORK,
      native,
      tokens,
      nfts: [],
      holdings,
      visibleHoldingCount: holdings.length,
      source: "public-rpc-manual-token",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load holdings",
      },
      { status: 500 }
    )
  }
}