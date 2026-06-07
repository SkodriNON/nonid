import {
  ethers
} from "ethers"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

const RPC_URL =
  "https://arbitrum-sepolia-rpc.publicnode.com"

const NETWORK = {
  name:
    "arbitrum-sepolia",
  chainId:
    421614
}

const CONSTITUTIONAL_NFT =
  process.env.NEXT_PUBLIC_CONSTITUTIONAL_NFT ||
  ""

const CONSTITUTIONAL_BOARD =
  process.env.NEXT_PUBLIC_CONSTITUTIONAL_BOARD ||
  ""

const SIGNER_MANAGER =
  process.env.NEXT_PUBLIC_SIGNER_MANAGER ||
  ""

const MULTISIG =
  process.env.NEXT_PUBLIC_MULTISIG ||
  ""

const TREASURY_VAULT =
  process.env.NEXT_PUBLIC_TREASURY_VAULT ||
  ""

const LIQUIDITY_CUSTODY =
  process.env.NEXT_PUBLIC_LIQUIDITY_CUSTODY ||
  ""

const EMERGENCY_CONSTITUTION =
  process.env.NEXT_PUBLIC_EMERGENCY_CONSTITUTION ||
  ""

const CONSTITUTIONAL_ACTIVATION =
  process.env.NEXT_PUBLIC_CONSTITUTIONAL_ACTIVATION ||
  ""

const ACTIVATION_ABI = [
  "function activationStatus() view returns (bool,bool,bool,bool,bool,bool,bool)",
  "function institutionActivated() view returns (bool)",
  "function activatedAt() view returns (uint256)"
]

const BOARD_ABI = [
  "function boardActivated() view returns (bool)",
  "function emergencyState() view returns (bool)"
]

function isAddress(
  value: string
) {
  return ethers.utils.isAddress(
    value
  )
}

async function safeCall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function GET() {
  try {
    const missing: string[] = []

    const required = {
      NEXT_PUBLIC_CONSTITUTIONAL_NFT:
        CONSTITUTIONAL_NFT,
      NEXT_PUBLIC_CONSTITUTIONAL_BOARD:
        CONSTITUTIONAL_BOARD,
      NEXT_PUBLIC_SIGNER_MANAGER:
        SIGNER_MANAGER,
      NEXT_PUBLIC_MULTISIG:
        MULTISIG,
      NEXT_PUBLIC_TREASURY_VAULT:
        TREASURY_VAULT,
      NEXT_PUBLIC_LIQUIDITY_CUSTODY:
        LIQUIDITY_CUSTODY,
      NEXT_PUBLIC_EMERGENCY_CONSTITUTION:
        EMERGENCY_CONSTITUTION,
      NEXT_PUBLIC_CONSTITUTIONAL_ACTIVATION:
        CONSTITUTIONAL_ACTIVATION
    }

    for (const [key, value] of Object.entries(
      required
    )) {
      if (
        !value ||
        !isAddress(value)
      ) {
        missing.push(key)
      }
    }

    if (missing.length > 0) {
      return Response.json(
        {
          success: false,
          error:
            "MISSING_OR_INVALID_ENV",
          missing
        },
        {
          status: 500
        }
      )
    }

    const provider =
      new ethers.providers.JsonRpcProvider(
        {
          url:
            RPC_URL,
          skipFetchSetup:
            true
        },
        NETWORK
      )

    const activation =
      new ethers.Contract(
        CONSTITUTIONAL_ACTIVATION,
        ACTIVATION_ABI,
        provider
      )

    const board =
      new ethers.Contract(
        CONSTITUTIONAL_BOARD,
        BOARD_ABI,
        provider
      )

    const activationStatus =
      await safeCall(
        async () =>
          await activation.activationStatus(),
        [
          false,
          false,
          false,
          false,
          false,
          false,
          false
        ]
      )

    const institutionActivated =
      await safeCall(
        async () =>
          await activation.institutionActivated(),
        false
      )

    const activatedAt =
      await safeCall(
        async () =>
          await activation.activatedAt(),
        ethers.BigNumber.from(0)
      )

    const boardActivated =
      await safeCall(
        async () =>
          await board.boardActivated(),
        false
      )

    const emergencyState =
      await safeCall(
        async () =>
          await board.emergencyState(),
        false
      )

    return Response.json({
      success: true,
      network: {
        name:
          NETWORK.name,
        chainId:
          NETWORK.chainId,
        rpc:
          "publicnode"
      },
      identityToBoardLink: {
        connected:
          true,
        mode:
          "read-only",
        source:
          "NexusNON.ID"
      },
      board: {
        address:
          CONSTITUTIONAL_BOARD,
        activated:
          boardActivated,
        emergencyState:
          emergencyState
      },
      activation: {
        address:
          CONSTITUTIONAL_ACTIVATION,
        nftReady:
          Boolean(
            activationStatus[0]
          ),
        boardReady:
          Boolean(
            activationStatus[1]
          ),
        multisigReady:
          Boolean(
            activationStatus[2]
          ),
        treasuryReady:
          Boolean(
            activationStatus[3]
          ),
        liquidityReady:
          Boolean(
            activationStatus[4]
          ),
        emergencyReady:
          Boolean(
            activationStatus[5]
          ),
        activated:
          Boolean(
            activationStatus[6]
          ),
        institutionActivated:
          Boolean(
            institutionActivated
          ),
        activatedAt:
          activatedAt.toString()
      },
      modules: {
        constitutionalNFT:
          CONSTITUTIONAL_NFT,
        signerManager:
          SIGNER_MANAGER,
        multisig:
          MULTISIG,
        treasuryVault:
          TREASURY_VAULT,
        liquidityCustody:
          LIQUIDITY_CUSTODY,
        emergencyConstitution:
          EMERGENCY_CONSTITUTION
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