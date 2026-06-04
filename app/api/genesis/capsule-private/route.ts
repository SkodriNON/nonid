import {
  ethers
} from "ethers"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

const ABI = [
  "function getCapsulePrivate(uint256 capsuleId) view returns ((uint256,uint8,uint8,address,bytes32,bytes32,bytes32,bytes,bytes,bytes,bytes32,bytes32,bytes32,uint256,uint256,uint256,uint256))"
]

const iface =
  new ethers.utils.Interface(ABI)

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

async function rpc(
  rpcUrl: string,
  method: string,
  params: any[]
) {
  const res =
    await fetch(
      rpcUrl,
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body:
          JSON.stringify({
            jsonrpc:
              "2.0",
            id:
              Date.now(),
            method,
            params
          })
      }
    )

  const data =
    await res.json()

  if (data.error) {
    throw new Error(
      data.error.message ||
      "RPC_ERROR"
    )
  }

  return data.result
}

function decodeBytes(
  value: string
) {
  try {
    return ethers.utils.toUtf8String(
      value
    )
  } catch {
    return ""
  }
}

export async function GET(
  req: Request
) {
  try {
    const url =
      new URL(req.url)

    const capsuleId =
      String(
        url.searchParams.get("capsuleId") || ""
      ).trim()

    if (
      !capsuleId ||
      !/^\d+$/.test(capsuleId)
    ) {
      return Response.json(
        {
          success: false,
          error:
            "INVALID_CAPSULE_ID"
        },
        {
          status: 400
        }
      )
    }

    const contract =
      getEnv([
        "NEXT_PUBLIC_GENESIS_CONTRACT",
        "NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS",
        "GENESIS_CONTRACT"
      ])

    const rpcUrl =
      getEnv([
        "ARBITRUM_SEPOLIA_RPC_URL",
        "NETWORK_RPC",
        "NEXT_PUBLIC_RPC_URL",
        "NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC",
        "NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL",
        "NEXT_PUBLIC_ARBITRUM_RPC"
      ])

    const operator =
      getEnv([
        "OPERATOR_WALLET",
        "NEXT_PUBLIC_OPERATOR_WALLET",
        "OWNER_WALLET"
      ])

    if (!contract) {
      throw new Error(
        "GENESIS_CONTRACT_MISSING"
      )
    }

    if (!rpcUrl) {
      throw new Error(
        "RPC_URL_MISSING"
      )
    }

    if (!operator) {
      throw new Error(
        "OPERATOR_WALLET_MISSING"
      )
    }

    const callData =
      iface.encodeFunctionData(
        "getCapsulePrivate",
        [
          capsuleId
        ]
      )

    const result =
      await rpc(
        rpcUrl,
        "eth_call",
        [
          {
            from:
              operator,
            to:
              contract,
            data:
              callData
          },
          "latest"
        ]
      )

    const decoded =
      iface.decodeFunctionResult(
        "getCapsulePrivate",
        result
      )

    const capsule =
      decoded[0]

    return Response.json({
      success: true,
      capsuleId,
      wallet:
        capsule[3],
      email:
        decodeBytes(
          capsule[7]
        ),
      phone:
        decodeBytes(
          capsule[8]
        ),
      name:
        decodeBytes(
          capsule[9]
        ),
      status:
        Number(
          capsule[2]
        )
    })

  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error:
          err?.message ||
          "CAPSULE_PRIVATE_READ_FAILED"
      },
      {
        status: 500
      }
    )
  }
}