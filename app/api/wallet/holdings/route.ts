import { NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export const dynamic = "force-dynamic"

const CHAIN_ID = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAIN_ID || "421614"
const RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
]

type TokenTransfer = {
  contractAddress: string
  tokenName?: string
  tokenSymbol?: string
  tokenDecimal?: string
}

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address")

    if (!address || !ethers.isAddress(address)) {
      return bad("Invalid wallet address")
    }

    if (!RPC_URL) {
      return bad("Missing NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL", 500)
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL)

    const nativeWei = await provider.getBalance(address)

    const native = {
      type: "native",
      chainId: CHAIN_ID,
      name: "Arbitrum Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
      contractAddress: null,
      rawBalance: nativeWei.toString(),
      balance: ethers.formatEther(nativeWei),
    }

    let transfers: TokenTransfer[] = []

    if (ETHERSCAN_API_KEY) {
      const url = new URL("https://api.etherscan.io/v2/api")
      url.searchParams.set("chainid", CHAIN_ID)
      url.searchParams.set("module", "account")
      url.searchParams.set("action", "tokentx")
      url.searchParams.set("address", address)
      url.searchParams.set("page", "1")
      url.searchParams.set("offset", "100")
      url.searchParams.set("sort", "desc")
      url.searchParams.set("apikey", ETHERSCAN_API_KEY)

      const res = await fetch(url.toString(), {
        cache: "no-store",
      })

      const data = await res.json()

      if (data?.status === "1" && Array.isArray(data.result)) {
        transfers = data.result
      }
    }

    const uniqueContracts = Array.from(
      new Map(
        transfers
          .filter((t) => t.contractAddress && ethers.isAddress(t.contractAddress))
          .map((t) => [t.contractAddress.toLowerCase(), t])
      ).values()
    )

    const erc20 = []

    for (const token of uniqueContracts.slice(0, 30)) {
      try {
        const contract = new ethers.Contract(token.contractAddress, ERC20_ABI, provider)

        const [rawBalance, decimalsRaw, symbolRaw, nameRaw] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals().catch(() => Number(token.tokenDecimal || 18)),
          contract.symbol().catch(() => token.tokenSymbol || "TOKEN"),
          contract.name().catch(() => token.tokenName || "Unknown Token"),
        ])

        const decimals = Number(decimalsRaw)

        if (rawBalance > 0n) {
          erc20.push({
            type: "erc20",
            chainId: CHAIN_ID,
            name: String(nameRaw),
            symbol: String(symbolRaw),
            decimals,
            contractAddress: token.contractAddress,
            rawBalance: rawBalance.toString(),
            balance: ethers.formatUnits(rawBalance, decimals),
          })
        }
      } catch {
        continue
      }
    }

    return NextResponse.json({
      ok: true,
      address,
      chainId: CHAIN_ID,
      holdings: [native, ...erc20],
      source: "rpc + etherscan-v2-token-transfers",
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown wallet holdings error",
      },
      { status: 500 }
    )
  }
}