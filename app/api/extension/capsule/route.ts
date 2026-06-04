import { NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"

export const dynamic = "force-dynamic"

const RPC_URL =
  process.env.ALCHEMY_ARBITRUM_SEPOLIA_RPC ||
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL

const GENESIS_CONTRACT =
  process.env.NEXT_PUBLIC_GENESIS_CONTRACT ||
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

const ABI = [
  "function getCapsulePublic(uint256 capsuleId) view returns (string label,uint256 createdAt,bool active,uint256 nonce,uint256 balance,bool privateIdentity,bool communication,bool notifications,bool marketing,bool sessionActive)",
]

function fail(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

export async function GET(req: NextRequest) {
  try {
    const capsuleId =
      req.nextUrl.searchParams.get("capsuleId") ||
      req.nextUrl.searchParams.get("capsule") ||
      ""

    if (!capsuleId || Number(capsuleId) <= 0) {
      return fail("Missing or invalid capsuleId")
    }

    if (!RPC_URL) {
      return fail("Missing RPC URL", 500)
    }

    if (!GENESIS_CONTRACT || !ethers.utils.isAddress(GENESIS_CONTRACT)) {
      return fail("Missing or invalid Genesis contract", 500)
    }

    const provider =
      new ethers.providers.StaticJsonRpcProvider(
        RPC_URL,
        {
          chainId: 421614,
          name: "arbitrum-sepolia",
        }
      )

    const contract =
      new ethers.Contract(
        GENESIS_CONTRACT,
        ABI,
        provider
      )

    const result =
      await contract.getCapsulePublic(
        ethers.BigNumber.from(capsuleId)
      )

    const capsule = {
      capsuleId: String(capsuleId),
      label: String(result.label || `Nexus Capsule #${capsuleId}`),
      createdAt: Number(result.createdAt || 0),
      active: Boolean(result.active),
      nonce: Number(result.nonce || 0),
      balance: Number(ethers.utils.formatUnits(result.balance || 0, 6)),
      privateIdentity: Boolean(result.privateIdentity),
      communication: Boolean(result.communication),
      notifications: Boolean(result.notifications),
      marketing: Boolean(result.marketing),
      sessionActive: Boolean(result.sessionActive),
    }

    return NextResponse.json({
      success: true,
      capsule,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load capsule",
      },
      { status: 500 }
    )
  }
}