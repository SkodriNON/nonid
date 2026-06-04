import { NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export const dynamic = "force-dynamic"

const CHAIN_ID = 421614
const NETWORK = "Arbitrum Sepolia"

const RPC_URL = process.env.ALCHEMY_ARBITRUM_SEPOLIA_RPC || ""
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || ""

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
}

async function safeJson(res: Response) {
  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(
      text?.startsWith("<!DOCTYPE")
        ? "Alchemy/API returned HTML instead of JSON"
        : text || "Invalid JSON response"
    )
  }
}

function formatHexBalance(hexBalance: string, decimals: number) {
  try {
    if (!hexBalance || hexBalance === "0x") return "0"

    return ethers.utils.formatUnits(
      ethers.BigNumber.from(hexBalance),
      decimals
    )
  } catch {
    return "0"
  }
}

async function rpcCall(method: string, params: unknown[]) {
  if (!RPC_URL) {
    throw new Error("Missing ALCHEMY_ARBITRUM_SEPOLIA_RPC")
  }

  const res = await fetch(RPC_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  })

  const data = await safeJson(res)

  if (!res.ok) {
    throw new Error(`Alchemy RPC HTTP ${res.status}`)
  }

  if (data?.error) {
    throw new Error(data.error.message || "Alchemy RPC error")
  }

  return data.result
}

async function getNftsForOwner(wallet: string) {
  if (!ALCHEMY_API_KEY) return []

  const allNfts: any[] = []
  let pageKey: string | undefined = undefined

  do {
    const url = new URL(
      `https://arb-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner`
    )

    url.searchParams.set("owner", wallet)
    url.searchParams.set("withMetadata", "true")
    url.searchParams.set("pageSize", "100")

    if (pageKey) {
      url.searchParams.set("pageKey", pageKey)
    }

    const res = await fetch(url.toString(), {
      cache: "no-store",
    })

    const data = await safeJson(res)

    if (!res.ok) {
      throw new Error(`Alchemy NFT HTTP ${res.status}`)
    }

    if (data?.error) {
      throw new Error(data.error.message || "Alchemy NFT API error")
    }

    if (Array.isArray(data?.ownedNfts)) {
      allNfts.push(...data.ownedNfts)
    }

    pageKey = data?.pageKey
  } while (pageKey && allNfts.length < 500)

  return allNfts
}

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("address") || ""

    if (!ethers.utils.isAddress(wallet)) {
      return jsonError("Invalid wallet address")
    }

    const checksumWallet = ethers.utils.getAddress(wallet)

    const nativeHex = await rpcCall("eth_getBalance", [
      checksumWallet,
      "latest",
    ])

    const nativeRaw = ethers.BigNumber.from(nativeHex)

    const native = {
      type: "native",
      name: "Arbitrum Sepolia Native Gas",
      symbol: "ETH",
      contractAddress: "native",
      decimals: 18,
      rawBalance: nativeRaw.toString(),
      balance: ethers.utils.formatEther(nativeRaw),
    }

    const tokenBalances = await rpcCall("alchemy_getTokenBalances", [
      checksumWallet,
      "erc20",
    ])

    const tokenRows: any[] = Array.isArray(tokenBalances?.tokenBalances)
      ? tokenBalances.tokenBalances
      : []

    const nonZeroTokenRows = tokenRows.filter((token) => {
      try {
        if (!token?.contractAddress) return false
        if (!ethers.utils.isAddress(token.contractAddress)) return false
        if (!token?.tokenBalance) return false

        return !ethers.BigNumber.from(token.tokenBalance).isZero()
      } catch {
        return false
      }
    })

    const tokens = await Promise.all(
      nonZeroTokenRows.slice(0, 300).map(async (token) => {
        try {
          const metadata = await rpcCall("alchemy_getTokenMetadata", [
            token.contractAddress,
          ])

          const decimals = Number(metadata?.decimals ?? 18)

          return {
            type: "erc20",
            name: metadata?.name || "Unknown Token",
            symbol: metadata?.symbol || "TOKEN",
            contractAddress: ethers.utils.getAddress(token.contractAddress),
            decimals,
            rawBalance: ethers.BigNumber.from(token.tokenBalance).toString(),
            balance: formatHexBalance(token.tokenBalance, decimals),
            logo: metadata?.logo || null,
          }
        } catch {
          return null
        }
      })
    )

    const cleanTokens = tokens.filter(Boolean)

    const nftsRaw = await getNftsForOwner(checksumWallet)

    const nfts = nftsRaw.map((nft: any) => ({
      type: "nft",
      standard: nft?.tokenType || "NFT",
      name:
        nft?.name ||
        nft?.title ||
        nft?.contract?.name ||
        "Unnamed NFT",
      symbol: nft?.contract?.symbol || "NFT",
      contractAddress: nft?.contract?.address
        ? ethers.utils.getAddress(nft.contract.address)
        : null,
      tokenId: nft?.tokenId || null,
      balance: nft?.balance || "1",
      image:
        nft?.image?.cachedUrl ||
        nft?.image?.pngUrl ||
        nft?.image?.thumbnailUrl ||
        nft?.raw?.metadata?.image ||
        null,
      collectionName: nft?.contract?.name || null,
    }))

    const holdings = [native, ...cleanTokens, ...nfts]

    return NextResponse.json({
      success: true,
      wallet: checksumWallet,
      chainId: CHAIN_ID,
      network: NETWORK,
      native,
      tokens: cleanTokens,
      nfts,
      holdings,
      visibleHoldingCount: holdings.length,
      erc20Count: cleanTokens.length,
      nftCount: nfts.length,
      source: "Alchemy Universal Holdings",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load universal holdings",
      },
      { status: 500 }
    )
  }
}