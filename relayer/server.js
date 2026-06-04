require("dotenv").config()

const http =
  require("http")

const { ethers } =
  require("ethers")

const PORT =
  process.env.RELAYER_PORT || 5050

const RPC_URL =
  process.env.ARBITRUM_SEPOLIA_RPC_URL

const GENESIS =
  process.env.NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS

const PRIVATE_KEY =
  process.env.OPERATOR_PRIVATE_KEY

const ABI = [
  "event CapsuleCreated(uint256 indexed capsuleId,address indexed capsuleWallet,uint8 capsuleType)",
  "function createCapsule(bytes32 emailHash, bytes encryptedEmail, bytes encryptedName, uint8 capsuleType) external returns(uint256,address)"
]

function send(
  res,
  status,
  data
) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  })

  res.end(
    JSON.stringify(data)
  )
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ""

    req.on("data", chunk => {
      body += chunk.toString()
    })

    req.on("end", () => {
      try {
        resolve(
          body ? JSON.parse(body) : {}
        )
      } catch (err) {
        reject(err)
      }
    })
  })
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase()
}

function normalizePrivateKey(key) {
  const clean =
    String(key || "").trim()

  return clean.startsWith("0x")
    ? clean
    : `0x${clean}`
}

function toEncryptedBytes(value) {
  return ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes(
      String(value || "")
    )
  )
}

async function handleCreateCapsule(
  req,
  res
) {
  try {
    if (!RPC_URL) {
      return send(res, 500, {
        success: false,
        message: "ARBITRUM_SEPOLIA_RPC_URL missing"
      })
    }

    if (!GENESIS) {
      return send(res, 500, {
        success: false,
        message: "NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS missing"
      })
    }

    if (!PRIVATE_KEY) {
      return send(res, 500, {
        success: false,
        message: "OPERATOR_PRIVATE_KEY missing"
      })
    }

    const body =
      await readBody(req)

    const email =
      body.email

    const name =
      body.name ||
      body.fullName ||
      ""

    const capsuleType =
      Number(
        body.capsuleType ?? 0
      )

    if (!email) {
      return send(res, 400, {
        success: false,
        message: "EMAIL_REQUIRED"
      })
    }

    const provider =
      new ethers.providers.StaticJsonRpcProvider(
        RPC_URL,
        {
          name: "arbitrum-sepolia",
          chainId: 421614
        }
      )

    const wallet =
      new ethers.Wallet(
        normalizePrivateKey(PRIVATE_KEY),
        provider
      )

    console.log(
      "RELAYER ADDRESS:",
      wallet.address
    )

    const cleanEmail =
      normalizeEmail(email)

    const emailHash =
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          cleanEmail
        )
      )

    const encryptedEmail =
      toEncryptedBytes(cleanEmail)

    const encryptedName =
      toEncryptedBytes(name)

    const contract =
      new ethers.Contract(
        GENESIS,
        ABI,
        wallet
      )

    const tx =
      await contract.createCapsule(
        emailHash,
        encryptedEmail,
        encryptedName,
        capsuleType
      )

    console.log(
      "CREATE CAPSULE TX:",
      tx.hash
    )

    const receipt =
      await tx.wait()

    if (!receipt || receipt.status !== 1) {
      return send(res, 500, {
        success: false,
        message: "TRANSACTION_REVERTED",
        txHash: tx.hash
      })
    }

    let capsuleId = null
    let capsuleWallet = null

    for (const log of receipt.logs) {
      try {
        const parsed =
          contract.interface.parseLog(log)

        if (parsed.name === "CapsuleCreated") {
          capsuleId =
            parsed.args.capsuleId.toString()

          capsuleWallet =
            parsed.args.capsuleWallet

          break
        }
      } catch {}
    }

    if (!capsuleId || !capsuleWallet) {
      return send(res, 500, {
        success: false,
        message: "CAPSULE_CREATED_EVENT_NOT_FOUND",
        txHash: tx.hash
      })
    }

    return send(res, 200, {
      success: true,
      txHash: tx.hash,
      capsuleId,
      capsuleWallet,
      nftOwner: capsuleWallet,
      emailHash
    })

  } catch (error) {
    console.error(
      "RELAYER_CREATE_CAPSULE_ERROR:",
      error
    )

    return send(res, 500, {
      success: false,
      message:
        error.reason ||
        error.message ||
        "CREATE_CAPSULE_FAILED"
    })
  }
}

const server =
  http.createServer(
    async (req, res) => {
      if (req.method === "OPTIONS") {
        return send(res, 200, {
          success: true
        })
      }

      if (
        req.method === "POST" &&
        req.url === "/create-capsule"
      ) {
        return handleCreateCapsule(
          req,
          res
        )
      }

      return send(res, 404, {
        success: false,
        message: "NOT_FOUND"
      })
    }
  )

server.listen(PORT, () => {
  console.log(
    `NEXUSNON RELAYER RUNNING ON http://localhost:${PORT}`
  )
})