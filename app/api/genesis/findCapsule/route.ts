import {
  ethers
} from "ethers"

export const runtime =
  "nodejs"

export const dynamic =
  "force-dynamic"

const ABI = [
  "function getCapsuleByEmailHash(bytes32 emailHash) external view returns(uint256)",
  "function getCapsuleByPhoneHash(bytes32 phoneHash) external view returns(uint256)",
  "function getCapsulePublic(uint256 capsuleId) external view returns(uint256,uint8,uint8,address,uint256,uint256,uint256,uint256)",
  "function getCapsuleWallet(uint256 capsuleId) external view returns(address)",
  "function ownerOf(uint256 tokenId) external view returns(address)"
]

const iface =
  new ethers.utils.Interface(ABI)

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, "")
}

function getEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]

    if (value && value.trim() !== "") {
      return value.trim()
    }
  }

  return ""
}

function timeoutPromise(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("RPC_TIMEOUT"))
    }, ms)
  })
}

async function rpc(
  rpcUrl: string,
  method: string,
  params: any[],
  timeout = 15000
) {
  const call = fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params
    })
  })

  const response: any =
    await Promise.race([
      call,
      timeoutPromise(timeout)
    ])

  const text =
    await response.text()

  let data: any

  try {
    data =
      JSON.parse(text)
  } catch {
    throw new Error(
      `RPC_RETURNED_NON_JSON: ${text.slice(0, 120)}`
    )
  }

  if (data.error) {
    throw new Error(
      data.error.message ||
      JSON.stringify(data.error)
    )
  }

  return data.result
}

async function callContract(
  rpcUrl: string,
  contractAddress: string,
  functionName: string,
  args: any[],
  operatorFrom?: string
) {
  const data =
    iface.encodeFunctionData(
      functionName,
      args
    )

  const callObject: any = {
    to:
      contractAddress,
    data
  }

  if (operatorFrom) {
    callObject.from =
      operatorFrom
  }

  const result =
    await rpc(
      rpcUrl,
      "eth_call",
      [
        callObject,
        "latest"
      ]
    )

  return iface.decodeFunctionResult(
    functionName,
    result
  )
}

function nextStepFromStatus(status: number) {
  if (status === 1) {
    return "pending-activation"
  }

  if (status === 2) {
    return "pup-login"
  }

  if (status === 3) {
    return "recover-pup"
  }

  return "unknown"
}

async function loadCapsule(
  rpcUrl: string,
  contractAddress: string,
  capsuleId: ethers.BigNumber
) {
  const publicResult =
    await callContract(
      rpcUrl,
      contractAddress,
      "getCapsulePublic",
      [
        capsuleId
      ]
    )

  const walletResult =
    await callContract(
      rpcUrl,
      contractAddress,
      "getCapsuleWallet",
      [
        capsuleId
      ]
    )

  const ownerResult =
    await callContract(
      rpcUrl,
      contractAddress,
      "ownerOf",
      [
        capsuleId
      ]
    )

  const status =
    Number(publicResult[2])

  const capsulePublic = {
    id:
      publicResult[0].toString(),
    capsuleType:
      Number(publicResult[1]),
    status,
    capsuleWallet:
      publicResult[3],
    createdAt:
      publicResult[4].toString(),
    activatedAt:
      publicResult[5].toString(),
    updatedAt:
      publicResult[6].toString(),
    nonce:
      publicResult[7].toString()
  }

  return {
    capsuleId:
      capsuleId.toString(),
    capsuleWallet:
      walletResult[0],
    nftOwner:
      ownerResult[0],
    status,
    capsulePublic,
    next:
      nextStepFromStatus(status)
  }
}

export async function POST(req: Request) {
  try {
    const body =
      await req.json()

    const email =
      String(body.email || "")

    const phone =
      String(body.phone || "")

    if (!email.trim()) {
      return Response.json(
        {
          success: false,
          exists: false,
          matched: false,
          error:
            "EMAIL_REQUIRED"
        },
        {
          status: 400
        }
      )
    }

    if (!phone.trim()) {
      return Response.json(
        {
          success: false,
          exists: false,
          matched: false,
          error:
            "PHONE_REQUIRED"
        },
        {
          status: 400
        }
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
        "NEXT_PUBLIC_RPC_URL",
        "NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC",
        "NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL",
        "NEXT_PUBLIC_ARBITRUM_RPC"
      ])

    const operatorWallet =
      getEnv([
        "OPERATOR_WALLET",
        "NEXT_PUBLIC_OPERATOR_WALLET",
        "OWNER_WALLET"
      ])

    if (!contractAddress) {
      return Response.json(
        {
          success: false,
          exists: false,
          matched: false,
          error:
            "CONTRACT_ADDRESS_MISSING"
        },
        {
          status: 500
        }
      )
    }

    if (!rpcUrl) {
      return Response.json(
        {
          success: false,
          exists: false,
          matched: false,
          error:
            "RPC_URL_MISSING"
        },
        {
          status: 500
        }
      )
    }

    if (!operatorWallet) {
      return Response.json(
        {
          success: false,
          exists: false,
          matched: false,
          error:
            "OPERATOR_WALLET_MISSING"
        },
        {
          status: 500
        }
      )
    }

    const cleanEmail =
      normalizeEmail(email)

    const cleanPhone =
      normalizePhone(phone)

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

    const emailResult =
      await callContract(
        rpcUrl,
        contractAddress,
        "getCapsuleByEmailHash",
        [
          emailHash
        ],
        operatorWallet
      )

    const phoneResult =
      await callContract(
        rpcUrl,
        contractAddress,
        "getCapsuleByPhoneHash",
        [
          phoneHash
        ],
        operatorWallet
      )

    const emailCapsuleId =
      ethers.BigNumber.from(
        emailResult[0]
      )

    const phoneCapsuleId =
      ethers.BigNumber.from(
        phoneResult[0]
      )

    const emailExists =
      !emailCapsuleId.isZero()

    const phoneExists =
      !phoneCapsuleId.isZero()

    if (
      !emailExists &&
      !phoneExists
    ) {
      return Response.json({
        success: true,
        exists: false,
        matched: false,
        conflict: false,
        next:
          "gateway",
        error:
          "CAPSULE_NOT_FOUND",
        message:
          "No Capsule exists for this email and phone.",
        emailHash,
        phoneHash
      })
    }

    if (
      emailExists &&
      !phoneExists
    ) {
      return Response.json({
        success: true,
        exists: true,
        matched: false,
        conflict: true,
        conflictField:
          "phone",
        capsuleId:
          emailCapsuleId.toString(),
        next:
          "connect",
        error:
          "PHONE_NOT_MATCHED",
        message:
          "This email belongs to a Capsule, but the phone number is wrong.",
        emailHash,
        phoneHash
      })
    }

    if (
      !emailExists &&
      phoneExists
    ) {
      return Response.json({
        success: true,
        exists: true,
        matched: false,
        conflict: true,
        conflictField:
          "email",
        capsuleId:
          phoneCapsuleId.toString(),
        next:
          "connect",
        error:
          "EMAIL_NOT_MATCHED",
        message:
          "This phone number belongs to a Capsule, but the email is wrong.",
        emailHash,
        phoneHash
      })
    }

    if (
      !emailCapsuleId.eq(phoneCapsuleId)
    ) {
      return Response.json({
        success: true,
        exists: true,
        matched: false,
        conflict: true,
        conflictField:
          "email_phone",
        next:
          "connect",
        error:
          "EMAIL_PHONE_CONFLICT",
        message:
          "Email and phone belong to different Capsules.",
        emailHash,
        phoneHash
      })
    }

    const capsule =
      await loadCapsule(
        rpcUrl,
        contractAddress,
        emailCapsuleId
      )

    return Response.json({
      success: true,
      exists: true,
      matched: true,
      conflict: false,
      emailHash,
      phoneHash,
      ...capsule
    })

  } catch (error: any) {
    console.error(
      "FIND_CAPSULE_ERROR:",
      error
    )

    return Response.json(
      {
        success: false,
        exists: false,
        matched: false,
        error:
          error?.message ||
          "FIND_CAPSULE_FAILED"
      },
      {
        status: 500
      }
    )
  }
}