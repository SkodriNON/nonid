export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

function getEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]

    if (value && value.trim() !== "") {
      return value.trim()
    }
  }

  return ""
}

function json(data: any, status = 200) {
  return Response.json(data, { status })
}

function short(value: string) {
  if (!value) return ""
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function formatUnits(raw: string, decimals: number) {
  const clean = String(raw || "0")
  const dec = Number.isFinite(decimals) ? decimals : 18

  if (!/^\d+$/.test(clean)) return "0"
  if (dec <= 0) return clean

  const padded = clean.padStart(dec + 1, "0")
  const whole = padded.slice(0, -dec)
  const fraction = padded.slice(-dec).replace(/0+$/, "")

  return fraction ? `${whole}.${fraction}` : whole
}

async function etherscanV2(params: Record<string, string>) {
  const key =
    getEnv([
      "ETHERSCAN_API_KEY",
      "ARBISCAN_API_KEY"
    ])

  if (!key) {
    throw new Error("ETHERSCAN_API_KEY_MISSING")
  }

  const url =
    new URL("https://api.etherscan.io/v2/api")

  url.searchParams.set("chainid", "421614")

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  url.searchParams.set("apikey", key)

  const response =
    await fetch(url.toString(), {
      cache: "no-store"
    })

  const data =
    await response.json()

  if (
    data.status === "0" &&
    data.message !== "No transactions found"
  ) {
    throw new Error(
      String(data.result || data.message || "ETHERSCAN_V2_ERROR")
    )
  }

  return data.result
}

export async function GET(req: Request) {
  try {
    const url =
      new URL(req.url)

    const wallet =
      String(url.searchParams.get("wallet") || "").trim()

    if (
      !wallet ||
      !/^0x[a-fA-F0-9]{40}$/.test(wallet)
    ) {
      return json(
        {
          success: false,
          error: "INVALID_WALLET"
        },
        400
      )
    }

    const nativeRaw =
      await etherscanV2({
        module: "account",
        action: "balance",
        address: wallet,
        tag: "latest"
      })

    const native = {
      type: "native",
      name: "Arbitrum Sepolia Native Gas",
      symbol: "ETH",
      contractAddress: "native",
      decimals: 18,
      rawBalance: String(nativeRaw || "0"),
      balance: formatUnits(String(nativeRaw || "0"), 18)
    }

    const transfers =
      await etherscanV2({
        module: "account",
        action: "tokentx",
        address: wallet,
        startblock: "0",
        endblock: "999999999",
        sort: "desc"
      })

    const tokenMap =
      new Map<string, any>()

    if (Array.isArray(transfers)) {
      for (const tx of transfers) {
        const tokenAddress =
          String(tx.contractAddress || "").toLowerCase()

        if (
          !tokenAddress ||
          !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)
        ) {
          continue
        }

        if (!tokenMap.has(tokenAddress)) {
          tokenMap.set(tokenAddress, {
            type: "erc20",
            name: tx.tokenName || "Unknown Token",
            symbol: tx.tokenSymbol || short(tokenAddress),
            contractAddress: tokenAddress,
            decimals: Number(tx.tokenDecimal || 18),
            rawBalance: "0",
            balance: "0"
          })
        }
      }
    }

    const tokens: any[] =
      []

    for (const token of tokenMap.values()) {
      try {
        const raw =
          await etherscanV2({
            module: "account",
            action: "tokenbalance",
            contractaddress: token.contractAddress,
            address: wallet,
            tag: "latest"
          })

        const rawString =
          String(raw || "0")

        if (rawString === "0") {
          continue
        }

        tokens.push({
          ...token,
          rawBalance: rawString,
          balance: formatUnits(rawString, token.decimals)
        })
      } catch {}
    }

    return json({
      success: true,
      wallet,
      chainId: 421614,
      network: "Arbitrum Sepolia",
      native,
      tokens,
      holdings: [
        native,
        ...tokens
      ],
      discoveredTokenCount: tokenMap.size,
      visibleHoldingCount: tokens.length + 1
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