import { ethers } from "ethers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ABI = [
  "function mint(address to,uint256 amount) external"
]

const CHAIN_ID = 421614

function json(data: any, status = 200) {
  return Response.json(data, { status })
}

function getEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]
    if (value && value.trim() !== "") return value.trim()
  }
  return ""
}

function normalizePrivateKey(key: string) {
  const clean = key.trim()
  return clean.startsWith("0x") ? clean : `0x${clean}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const walletAddress = String(body.wallet || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const phone = String(body.phone || "").trim()

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return json({ success: false, message: "INVALID_WALLET" }, 400)
    }

    if (!email || !email.includes("@")) {
      return json({ success: false, message: "INVALID_EMAIL" }, 400)
    }

    if (!phone || phone.length < 6) {
      return json({ success: false, message: "INVALID_PHONE" }, 400)
    }

    const rpcUrl = getEnv([
      "ARBITRUM_SEPOLIA_RPC_URL",
      "NETWORK_RPC",
      "NEXT_PUBLIC_RPC_URL"
    ])

    const privateKey = getEnv([
      "OPERATOR_PRIVATE_KEY"
    ])

    const usdtAddress = getEnv([
      "NEXT_PUBLIC_USDT_TOKEN",
      "MOCK_USDT_ADDRESS",
      "USDT_TOKEN"
    ])

    if (!rpcUrl) return json({ success: false, message: "RPC_MISSING" }, 500)
    if (!privateKey) return json({ success: false, message: "OPERATOR_PRIVATE_KEY_MISSING" }, 500)
    if (!usdtAddress) return json({ success: false, message: "USDT_TOKEN_MISSING" }, 500)

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      name: "arbitrum-sepolia",
      chainId: CHAIN_ID
    })

    const signer = new ethers.Wallet(
      normalizePrivateKey(privateKey),
      provider
    )

    const token = new ethers.Contract(
      usdtAddress,
      ABI,
      signer
    )

    const amount = ethers.utils.parseUnits("10", 6)

    const tx = await token.mint(walletAddress, amount)
    const receipt = await tx.wait()

    return json({
      success: true,
      message: "10 mUSDT sent",
      wallet: walletAddress,
      email,
      phone,
      amount: "10",
      symbol: "mUSDT",
      txHash: receipt.transactionHash
    })

  } catch (err: any) {
    return json({
      success: false,
      message: err?.message || "SEND_USDT_FAILED"
    }, 500)
  }
}