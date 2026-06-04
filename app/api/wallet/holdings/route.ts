import {
  ethers
} from "ethers"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
]

function getEnv(
  names: string[]
) {
  for (const name of names) {
    const value =
      process.env[name]

    if (
      value &&
      value.trim() !== ""
    ) {
      return value.trim()
    }
  }

  return ""
}

function json(
  data: any,
  status = 200
) {
  return Response.json(
    data,
    { status }
  )
}

function short(
  value: string
) {
  if (!value) return ""

  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

async function readTokenMeta(
  provider: ethers.providers.JsonRpcProvider,
  token: string
) {
  const contract =
    new ethers.Contract(
      token,
      ERC20_ABI,
      provider
    )

  let decimals = 18
  let symbol =
    short(token)
  let name =
    "Unknown Token"

  try {
    decimals =
      Number(
        await contract.decimals()
      )
  } catch {}

  try {
    symbol =
      String(
        await contract.symbol()
      )
  } catch {}

  try {
    name =
      String(
        await contract.name()
      )
  } catch {}

  return {
    contract,
    decimals,
    symbol,
    name
  }
}

export async function GET(
  req: Request
) {
  try {
    const url =
      new URL(req.url)

    const wallet =
      String(
        url.searchParams.get("wallet") || ""
      ).trim()

    if (
      !wallet ||
      !/^0x[a-fA-F0-9]{40}$/.test(wallet)
    ) {
      return json(
        {
          success: false,
          error:
            "INVALID_WALLET"
        },
        400
      )
    }

    const rpcUrl =
      getEnv([
        "ARBITRUM_SEPOLIA_RPC_URL",
        "NETWORK_RPC",
        "NEXT_PUBLIC_RPC_URL",
        "NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC",
        "NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL",
        "NEXT_PUBLIC_ARBITRUM_RPC"
      ])

    const arbiscanKey =
      getEnv([
        "ARBISCAN_API_KEY",
        "ETHERSCAN_API_KEY"
      ])

    if (!rpcUrl) {
      return json(
        {
          success: false,
          error:
            "RPC_URL_MISSING"
        },
        500
      )
    }

    if (!arbiscanKey) {
      return json(
        {
          success: false,
          error:
            "ARBISCAN_API_KEY_MISSING"
        },
        500
      )
    }

    const provider =
      new ethers.providers.JsonRpcProvider(
        rpcUrl,
        {
          name:
            "arbitrum-sepolia",
          chainId:
            421614
        }
      )

    const nativeWei =
      await provider.getBalance(
        wallet
      )

    const native = {
      type:
        "native",
      name:
        "Arbitrum Sepolia Native Gas",
      symbol:
        "ETH",
      contractAddress:
        "native",
      decimals:
        18,
      rawBalance:
        nativeWei.toString(),
      balance:
        ethers.utils.formatEther(
          nativeWei
        )
    }

    const apiUrl =
      new URL(
        "https://api-sepolia.arbiscan.io/api"
      )

    apiUrl.searchParams.set(
      "module",
      "account"
    )

    apiUrl.searchParams.set(
      "action",
      "tokentx"
    )

    apiUrl.searchParams.set(
      "address",
      wallet
    )

    apiUrl.searchParams.set(
      "startblock",
      "0"
    )

    apiUrl.searchParams.set(
      "endblock",
      "999999999"
    )

    apiUrl.searchParams.set(
      "sort",
      "desc"
    )

    apiUrl.searchParams.set(
      "apikey",
      arbiscanKey
    )

    const response =
      await fetch(
        apiUrl.toString(),
        {
          cache:
            "no-store"
        }
      )

    const data =
      await response.json()

    const transfers =
      Array.isArray(data?.result)
        ? data.result
        : []

    const tokenMap =
      new Map<string, any>()

    for (const tx of transfers) {
      const tokenAddress =
        String(
          tx.contractAddress || ""
        ).toLowerCase()

      if (
        !tokenAddress ||
        !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)
      ) {
        continue
      }

      if (
        !tokenMap.has(tokenAddress)
      ) {
        tokenMap.set(
          tokenAddress,
          {
            contractAddress:
              tokenAddress,
            name:
              tx.tokenName ||
              "Unknown Token",
            symbol:
              tx.tokenSymbol ||
              short(tokenAddress),
            decimals:
              Number(
                tx.tokenDecimal || 18
              )
          }
        )
      }
    }

    const tokens: any[] =
      []

    for (const token of tokenMap.values()) {
      try {
        const meta =
          await readTokenMeta(
            provider,
            token.contractAddress
          )

        const balanceRaw =
          await meta.contract.balanceOf(
            wallet
          )

        if (
          ethers.BigNumber
            .from(balanceRaw)
            .isZero()
        ) {
          continue
        }

        tokens.push({
          type:
            "erc20",
          name:
            meta.name ||
            token.name,
          symbol:
            meta.symbol ||
            token.symbol,
          contractAddress:
            token.contractAddress,
          decimals:
            meta.decimals ??
            token.decimals,
          rawBalance:
            balanceRaw.toString(),
          balance:
            ethers.utils.formatUnits(
              balanceRaw,
              meta.decimals ??
                token.decimals
            )
        })

      } catch {}
    }

    return json({
      success: true,
      wallet,
      chainId:
        421614,
      network:
        "Arbitrum Sepolia",
      native,
      tokens,
      holdings: [
        native,
        ...tokens
      ],
      discoveredTokenCount:
        tokenMap.size,
      visibleHoldingCount:
        tokens.length + 1
    })

  } catch (err: any) {
    return json(
      {
        success: false,
        error:
          err?.message ||
          "WALLET_HOLDINGS_FAILED"
      },
      500
    )
  }
}