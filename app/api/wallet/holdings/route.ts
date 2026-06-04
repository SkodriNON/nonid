import { NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export const dynamic = "force-dynamic"

const CHAIN_ID = 421614
const NETWORK = "Arbitrum Sepolia"

const RPC_URL =
  process.env.ALCHEMY_ARBITRUM_SEPOLIA_RPC ||
  "https://sepolia-rollup.arbitrum.io/rpc"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  )
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

  const data = await res.json()

  if (data?.error) {
    throw new Error(data.error.message || "RPC error")
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

    const data = await res.json()

    if (Array.isArray(data?.ownedNfts)) {
      allNfts.push(...data.ownedNfts)
    }

    pageKey = data?.pageKey
  } while (pageKey && allNfts.length < 500)

  return allNfts
}

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("address")

    if (!wallet || !ethers.utils.isAddress(wallet)) {
      return jsonError("Invalid wallet address")
    }

    const nativeHex =
      await rpcCall("eth_getBalance", [
        wallet,
        "latest",
      ])

    const native = {
      type: "native",
      name: "Arbitrum Sepolia Native Gas",
      symbol: "ETH",
      contractAddress: "native",
      decimals: 18,
      rawBalance: ethers.BigNumber.from(nativeHex).toString(),
      balance: ethers.utils.formatEther(
        ethers.BigNumber.from(nativeHex)
      ),
    }

    let tokenRows: any[] = []

    try {
      const tokenBalances =
        await rpcCall("alchemy_getTokenBalances", [
          wallet,
          "erc20",
        ])

      tokenRows = Array.isArray(tokenBalances?.tokenBalances)
        ? tokenBalances.tokenBalances
        : []
    } catch {
      tokenRows = []
    }

    const nonZeroTokenRows =
      tokenRows.filter((token) => {
        try {
          if (!token?.contractAddress) return false
          if (!ethers.utils.isAddress(token.contractAddress)) return false
          if (!token?.tokenBalance) return false

          return !ethers.BigNumber.from(token.tokenBalance).isZero()
        } catch {
          return false
        }
      })

    const tokens =
      await Promise.all(
        nonZeroTokenRows.slice(0, 200).map(async (token) => {
          try {
            const metadata =
              await rpcCall("alchemy_getTokenMetadata", [
                token.contractAddress,
              ])

            const decimals =
              Number(metadata?.decimals ?? 18)

            return {
              type: "erc20",
              name: metadata?.name || "Unknown Token",
              symbol: metadata?.symbol || "TOKEN",
              contractAddress: token.contractAddress,
              decimals,
              rawBalance: ethers.BigNumber.from(
                token.tokenBalance
              ).toString(),
              balance: formatHexBalance(
                token.tokenBalance,
                decimals
              ),
              logo: metadata?.logo || null,
            }
          } catch {
            return null
          }
        })
      )

    const cleanTokens =
      tokens.filter(Boolean)

    const nftsRaw =
      await getNftsForOwner(wallet)

    const nfts =
      nftsRaw.map((nft: any) => ({
        type: "nft",
        standard: nft?.tokenType || "NFT",
        name:
          nft?.name ||
          nft?.title ||
          nft?.contract?.name ||
          "Unnamed NFT",
        symbol: nft?.contract?.symbol || "NFT",
        contractAddress: nft?.contract?.address || null,
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

    const holdings = [
      native,
      ...cleanTokens,
      ...nfts,
    ]

    return NextResponse.json({
      success: true,
      wallet,
      chainId: CHAIN_ID,
      network: NETWORK,
      native,
      tokens: cleanTokens,
      nfts,
      holdings,
      visibleHoldingCount: holdings.length,
      erc20Count: cleanTokens.length,
      nftCount: nfts.length,
      source: "Universal JSON-RPC + Alchemy NFT",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown universal holdings error",
      },
      { status: 500 }
    )
  }
}