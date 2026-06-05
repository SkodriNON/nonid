import {
  ethers
} from "ethers"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

const ABI = [
  "event CapsuleCreated(uint256 indexed capsuleId,address indexed capsuleWallet,uint8 capsuleType)",
  "function createCapsule(bytes32 emailHash,bytes32 phoneHash,bytes32 antiPhishingHash,bytes encryptedEmail,bytes encryptedPhone,bytes encryptedName,uint8 capsuleType) external returns(uint256,address)"
]

const iface =
  new ethers.utils.Interface(ABI)

const CHAIN_ID =
  421614

function json(
  data: any,
  status = 200
) {
  return Response.json(
    data,
    { status }
  )
}

function normalizeEmail(
  email: string
) {
  return email
    .trim()
    .toLowerCase()
}

function normalizePhone(
  phone: string
) {
  return phone
    .trim()
    .replace(/\s+/g, "")
}

function normalizeAntiPhishing(
  antiPhishing: string
) {
  return antiPhishing
    .trim()
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

function toEncryptedBytes(
  value: string
) {
  return ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes(
      value || ""
    )
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

async function rpc(
  rpcUrl: string,
  method: string,
  params: any[]
) {
  const response =
    await fetch(
      rpcUrl,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          "Accept":
            "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
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

    const email =
      body?.email

    const phone =
      body?.phone

    const antiPhishing =
      body?.antiPhishing ||
      body?.antiPhishingCode ||
      body?.phishingCode

    const name =
      body?.name ||
      body?.fullName ||
      body?.username ||
      ""
    
    const functionalStamp =
  body?.functionalStamp &&
  typeof body.functionalStamp === "object"
    ? body.functionalStamp
    : {}

    const capsuleType =
      Number(
        body?.capsuleType ?? 0
      )

    if (
      !email ||
      typeof email !== "string"
    ) {
      return json(
        {
          success: false,
          message:
            "EMAIL_REQUIRED"
        },
        400
      )
    }

    if (
      !phone ||
      typeof phone !== "string"
    ) {
      return json(
        {
          success: false,
          message:
            "PHONE_REQUIRED"
        },
        400
      )
    }

    if (
      !antiPhishing ||
      typeof antiPhishing !== "string"
    ) {
      return json(
        {
          success: false,
          message:
            "ANTI_PHISHING_REQUIRED"
        },
        400
      )
    }

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
        "NEXT_PUBLIC_RPC_URL"
      ])

    const privateKey =
      getEnv([
        "OPERATOR_PRIVATE_KEY"
      ])

    if (!contractAddress) {
      return json(
        {
          success: false,
          message:
            "GENESIS_CONTRACT missing"
        },
        500
      )
    }

    if (!rpcUrl) {
      return json(
        {
          success: false,
          message:
            "ARBITRUM_SEPOLIA_RPC_URL or NETWORK_RPC missing"
        },
        500
      )
    }

    if (!privateKey) {
      return json(
        {
          success: false,
          message:
            "OPERATOR_PRIVATE_KEY missing"
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

    console.log(
      "RELAYER ADDRESS:",
      wallet.address
    )

    const cleanEmail =
      normalizeEmail(
        email
      )

    const cleanPhone =
      normalizePhone(
        phone
      )

    const cleanAntiPhishing =
      normalizeAntiPhishing(
        antiPhishing
      )

    const emailHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          cleanEmail
        )
      )

    const phoneHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          cleanPhone
        )
      )

    const antiPhishingHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          cleanAntiPhishing
        )
      )

    const encryptedEmail =
      toEncryptedBytes(
        cleanEmail
      )

    const encryptedPhone =
      toEncryptedBytes(
        cleanPhone
      )

    const capsuleMetadata =
  JSON.stringify({
    name:
      String(name),
    functionalStamp,
    stampedAt:
      Date.now(),
    stampVersion:
      "NEXUSNON_CAPSULE_STAMP_V1"
  })

const encryptedName =
  toEncryptedBytes(
    capsuleMetadata
  )

    const txData =
      iface.encodeFunctionData(
        "createCapsule",
        [
          emailHash,
          phoneHash,
          antiPhishingHash,
          encryptedEmail,
          encryptedPhone,
          encryptedName,
          capsuleType
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

    const signedTx =
      await wallet.signTransaction(
        tx
      )

    const txHash =
      await rpc(
        rpcUrl,
        "eth_sendRawTransaction",
        [
          signedTx
        ]
      )

    console.log(
      "CREATE CAPSULE TX:",
      txHash
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
          message:
            "TRANSACTION_REVERTED",
          txHash
        },
        500
      )
    }

    let capsuleId: string | null =
      null

    let capsuleWallet: string | null =
      null

    for (const log of receipt.logs) {
      try {
        const parsed =
          iface.parseLog({
            topics:
              log.topics,
            data:
              log.data
          })

        if (
          parsed.name ===
          "CapsuleCreated"
        ) {
          capsuleId =
            parsed.args
              .capsuleId
              .toString()

          capsuleWallet =
            parsed.args
              .capsuleWallet

          break
        }
      } catch {}
    }

    if (
      !capsuleId ||
      !capsuleWallet
    ) {
      return json(
        {
          success: false,
          message:
            "CAPSULE_CREATED_EVENT_NOT_FOUND",
          txHash
        },
        500
      )
    }

    return json({
  success: true,
  existing: false,
  txHash,
  capsuleId,
  capsuleWallet,
  nftOwner:
    capsuleWallet,
  emailHash,
  phoneHash,
  antiPhishingHash,
  functionalStamp
})

  } catch (error: any) {
    console.error(
      "CREATE_CAPSULE_ERROR:",
      error
    )

    return json(
      {
        success: false,
        message:
          error?.message ||
          "CREATE_CAPSULE_FAILED"
      },
      500
    )
  }
}