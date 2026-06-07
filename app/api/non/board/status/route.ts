import {
  ethers
} from "ethers"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

const RPC_URL =
  "https://sepolia-rollup.arbitrum.io/rpc"

const ACTIVATION =
  process.env.NEXT_PUBLIC_CONSTITUTIONAL_ACTIVATION ||
  ""

const BOARD =
  process.env.NEXT_PUBLIC_CONSTITUTIONAL_BOARD ||
  ""

const ABI = [
  "function activationStatus() view returns (bool,bool,bool,bool,bool,bool,bool)",
  "function institutionActivated() view returns (bool)",
  "function activatedAt() view returns (uint256)"
]

const BOARD_ABI = [
  "function boardActivated() view returns (bool)",
  "function signerCount() view returns (uint256)",
  "function emergencyState() view returns (bool)"
]

export async function GET() {
  try {
    if (!RPC_URL) {
      throw new Error("RPC_URL_MISSING")
    }

    const provider =
  new ethers.providers.JsonRpcProvider(
    RPC_URL
  )

    const activation =
      new ethers.Contract(
        ACTIVATION,
        ABI,
        provider
      )

    const board =
      new ethers.Contract(
        BOARD,
        BOARD_ABI,
        provider
      )

    const status =
      await activation.activationStatus()

    const activated =
      await activation.institutionActivated()

    const activatedAt =
      await activation.activatedAt()

    const boardActivated =
      await board.boardActivated()

    const signerCount =
      await board.signerCount()

    const emergencyState =
      await board.emergencyState()

    return Response.json({
      success: true,
      board: {
        address: BOARD,
        activated: boardActivated,
        signerCount:
          signerCount.toString(),
        emergencyState
      },
      activation: {
        address: ACTIVATION,
        nftReady: status[0],
        boardReady: status[1],
        multisigReady: status[2],
        treasuryReady: status[3],
        liquidityReady: status[4],
        emergencyReady: status[5],
        activated: status[6],
        institutionActivated: activated,
        activatedAt:
          activatedAt.toString()
      },
      modules: {
        nft:
          process.env.NEXT_PUBLIC_CONSTITUTIONAL_NFT,
        signerManager:
          process.env.NEXT_PUBLIC_SIGNER_MANAGER,
        multisig:
          process.env.NEXT_PUBLIC_MULTISIG,
        treasuryVault:
          process.env.NEXT_PUBLIC_TREASURY_VAULT,
        liquidityCustody:
          process.env.NEXT_PUBLIC_LIQUIDITY_CUSTODY,
        emergencyConstitution:
          process.env.NEXT_PUBLIC_EMERGENCY_CONSTITUTION
      }
    })

  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "BOARD_STATUS_FAILED"
      },
      {
        status: 500
      }
    )
  }
}