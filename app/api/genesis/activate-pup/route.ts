import { ethers } from "ethers"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

const ABI = [
  "function activatePUP(uint256 capsuleId,bytes32 pinProofHash,bytes32 pukProofHash,bytes32 pupProofHash,uint8 feeToken)"
]

const CHAIN_ID = 421614

function json(
  data: any,
  status = 200
) {
  return Response.json(
    data,
    { status }
  )
}

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

function normalizePrivateKey(
  key: string
) {
  const clean =
    key.trim()

  return clean.startsWith("0x")
    ? clean
    : `0x${clean}`
}

async function rpc(
  rpcUrl: string,
  method: string,
  params: any[]
) {
  const response =
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
    await response.json()

  if (data.error) {
    throw new Error(
      data.error.message ||
      JSON.stringify(data.error)
    )
  }

  return data.result
}

async function waitForReceipt(
  rpcUrl: string,
  txHash: string
) {
  for (let i = 0; i < 60; i++) {
    const receipt =
      await rpc(
        rpcUrl,
        "eth_getTransactionReceipt",
        [
          txHash
        ]
      )

    if (receipt) {
      return receipt
    }

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 2000)
    )
  }

  throw new Error(
    "TRANSACTION_RECEIPT_TIMEOUT"
  )
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json()

    const capsuleId =
      Number(
        body.capsuleId
      )

    const pinProofHash =
      String(
        body.pinProofHash || ""
      ).trim()

    const pukProofHash =
      String(
        body.pukProofHash || ""
      ).trim()

    const pupProofHash =
      String(
        body.pupProofHash || ""
      ).trim()

    const contractAddress =
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

    const privateKey =
      getEnv([
        "OPERATOR_PRIVATE_KEY",
        "PRIVATE_KEY"
      ])

    if (
      !capsuleId ||
      !pinProofHash ||
      !pukProofHash ||
      !pupProofHash
    ) {
      return json(
        {
          success: false,
          message:
            "INVALID_INPUT",
          debug: {
            capsuleId,
            hasPinProofHash:
              Boolean(pinProofHash),
            hasPukProofHash:
              Boolean(pukProofHash),
            hasPupProofHash:
              Boolean(pupProofHash)
          }
        },
        400
      )
    }

    if (!contractAddress) {
      return json(
        {
          success: false,
          message:
            "GENESIS_CONTRACT_MISSING"
        },
        500
      )
    }

    if (!rpcUrl) {
      return json(
        {
          success: false,
          message:
            "RPC_URL_MISSING"
        },
        500
      )
    }

    if (!privateKey) {
      return json(
        {
          success: false,
          message:
            "OPERATOR_PRIVATE_KEY_MISSING"
        },
        500
      )
    }

    const wallet =
      new ethers.Wallet(
        normalizePrivateKey(
          privateKey
        )
      )

    const iface =
      new ethers.utils.Interface(
        ABI
      )

    const txData =
      iface.encodeFunctionData(
        "activatePUP",
        [
          capsuleId,
          pinProofHash,
          pukProofHash,
          pupProofHash,
          0
        ]
      )

    const nonceHex =
      await rpc(
        rpcUrl,
        "eth_getTransactionCount",
        [
          wallet.address,
          "pending"
        ]
      )

    const gasPriceHex =
      await rpc(
        rpcUrl,
        "eth_gasPrice",
        []
      )

    const gasPrice =
      ethers.BigNumber
        .from(gasPriceHex)
        .mul(2)

    const estimatedGasHex =
      await rpc(
        rpcUrl,
        "eth_estimateGas",
        [
          {
            from:
              wallet.address,
            to:
              contractAddress,
            data:
              txData,
            value:
              "0x0"
          }
        ]
      )

    const gasLimit =
      ethers.BigNumber
        .from(estimatedGasHex)
        .mul(120)
        .div(100)

    const tx = {
      to:
        contractAddress,
      data:
        txData,
      value:
        ethers.constants.Zero,
      nonce:
        ethers.BigNumber
          .from(nonceHex)
          .toNumber(),
      gasPrice,
      gasLimit,
      chainId:
        CHAIN_ID
    }

    const signed =
      await wallet.signTransaction(
        tx
      )

    const txHash =
      await rpc(
        rpcUrl,
        "eth_sendRawTransaction",
        [
          signed
        ]
      )

    const receipt =
      await waitForReceipt(
        rpcUrl,
        txHash
      )

    if (
      !receipt ||
      receipt.status !== "0x1"
    ) {
      return json(
        {
          success: false,
          txHash,
          message:
            "ACTIVATION_FAILED"
        },
        500
      )
    }

    return json({
      success: true,
      txHash,
      capsuleId
    })

  } catch (err: any) {
    return json(
      {
        success: false,
        message:
          err?.message ||
          "ACTIVATE_PUP_FAILED"
      },
      500
    )
  }
}