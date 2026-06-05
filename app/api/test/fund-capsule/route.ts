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

    const capsuleWallet = String(body.capsuleWallet || body.wallet || "").trim()

    if (!/^0x[a-fA-F0-9]{40}$/.test(capsuleWallet)) {
      return json({ success: false, message: "INVALID_CAPSULE_WALLET" }, 400)
    }

    const rpcUrl = getEnv([
      "ARBITRUM_SEPOLIA_RPC_URL",
      "NETWORK_RPC",
      "NEXT_PUBLIC_RPC_URL"
    ])

    const privateKey = getEnv([
      "OPERATOR_PRIVATE_KEY"
    ])

    const tokenAddress = getEnv([
      "MOCK_USDT_ADDRESS",
      "USDT_TOKEN",
      "NEXT_PUBLIC_USDT_TOKEN"
    ])

    if (!rpcUrl) return json({ success: false, message: "RPC_MISSING" }, 500)
    if (!privateKey) return json({ success: false, message: "OPERATOR_PRIVATE_KEY_MISSING" }, 500)
    if (!tokenAddress) return json({ success: false, message: "MOCK_USDT_ADDRESS_MISSING" }, 500)

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      name: "arbitrum-sepolia",
      chainId: CHAIN_ID
    })

    const wallet = new ethers.Wallet(normalizePrivateKey(privateKey), provider)

    const token = new ethers.Contract(tokenAddress, ABI, wallet)

    const amount = ethers.utils.parseUnits("10", 6)

    const tx = await token.mint(capsuleWallet, amount)
    const receipt = await tx.wait()

    return json({
      success: true,
      capsuleWallet,
      amount: "10",
      symbol: "mUSDT",
      txHash: receipt.transactionHash
    })
  } catch (err: any) {
    return json({
      success: false,
      message: err?.message || "FUND_CAPSULE_FAILED"
    }, 500)
  }
}