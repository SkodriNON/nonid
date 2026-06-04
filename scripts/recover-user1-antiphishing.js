const fs =
  require("fs")

const path =
  require("path")

const {
  ethers
} =
  require("ethers")

function loadEnv() {

  const envPath =
    path.join(
      process.cwd(),
      ".env"
    )

  const envLocalPath =
    path.join(
      process.cwd(),
      ".env.local"
    )

  const files =
    [
      envPath,
      envLocalPath
    ]

  for (const file of files) {

    if (!fs.existsSync(file)) {
      continue
    }

    const lines =
      fs.readFileSync(file, "utf8")
        .split("\n")

    for (const line of lines) {

      const clean =
        line.trim()

      if (
        !clean ||
        clean.startsWith("#") ||
        !clean.includes("=")
      ) {
        continue
      }

      const index =
        clean.indexOf("=")

      const key =
        clean.slice(0, index).trim()

      const value =
        clean.slice(index + 1)
          .trim()
          .replace(/^"/, "")
          .replace(/"$/, "")

      if (!process.env[key]) {
        process.env[key] =
          value
      }
    }
  }
}

loadEnv()

const CHAIN_ID =
  421614

const CAPSULE_ID =
  "1"

const ANTI_PHISHING_CODE =
  "2020"

const ABI = [
  "function recoverPUP(uint256 capsuleId,bytes32 newPinProofHash,bytes32 newPukProofHash,bytes32 newPupProofHash,bool payWithNON,uint256 nonAmount) external",
  "function getCapsule(uint256 capsuleId) external view returns (tuple(uint256 id,uint8 capsuleType,uint8 status,address capsuleWallet,bytes32 emailHash,bytes encryptedEmail,bytes encryptedName,bytes32 pinProofHash,bytes32 pukProofHash,bytes32 pupProofHash,uint256 createdAt,uint256 activatedAt,uint256 updatedAt,uint256 nonce))",
  "function trustedOperators(address operator) external view returns(bool)"
]

function normalizePrivateKey(key) {

  const clean =
    key.trim()

  return clean.startsWith("0x")
    ? clean
    : `0x${clean}`
}

async function main() {

  const rpcUrl =
    process.env.ARBITRUM_SEPOLIA_RPC_URL

  const contractAddress =
    process.env.NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS

  const privateKey =
    process.env.OPERATOR_PRIVATE_KEY

  if (!rpcUrl) {
    throw new Error("ARBITRUM_SEPOLIA_RPC_URL missing")
  }

  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS missing")
  }

  if (!privateKey) {
    throw new Error("OPERATOR_PRIVATE_KEY missing")
  }

  const provider =
    new ethers.providers.JsonRpcProvider(
      rpcUrl
    )

  const wallet =
    new ethers.Wallet(
      normalizePrivateKey(privateKey),
      provider
    )

  const contract =
    new ethers.Contract(
      contractAddress,
      ABI,
      wallet
    )

  const isTrusted =
    await contract.trustedOperators(
      wallet.address
    )

  if (!isTrusted) {
    throw new Error(
      `RELAYER_NOT_TRUSTED: ${wallet.address}`
    )
  }

  const capsuleBefore =
    await contract.getCapsule(
      CAPSULE_ID
    )

  console.log(
    "Capsule before:",
    {
      id:
        capsuleBefore.id.toString(),
      status:
        Number(capsuleBefore.status),
      wallet:
        capsuleBefore.capsuleWallet,
      pinProofHash:
        capsuleBefore.pinProofHash
    }
  )

  const pinProofHash =
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `NEXUSNON_PIN:${CAPSULE_ID}:${ANTI_PHISHING_CODE}`
      )
    )

  const pukProofHash =
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `NEXUSNON_PUK:${CAPSULE_ID}:${ANTI_PHISHING_CODE}`
      )
    )

  const pupProofHash =
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        `NEXUSNON_PUP:${CAPSULE_ID}:${ANTI_PHISHING_CODE}`
      )
    )

  const tx =
    await contract.recoverPUP(
      CAPSULE_ID,
      pinProofHash,
      pukProofHash,
      pupProofHash,
      false,
      "0",
      {
        gasLimit:
          2000000
      }
    )

  console.log(
    "TX:",
    tx.hash
  )

  const receipt =
    await tx.wait()

  if (receipt.status !== 1) {
    throw new Error(
      "RECOVER_PUP_REVERTED"
    )
  }

  const capsuleAfter =
    await contract.getCapsule(
      CAPSULE_ID
    )

  console.log(
    "Capsule after:",
    {
      id:
        capsuleAfter.id.toString(),
      status:
        Number(capsuleAfter.status),
      wallet:
        capsuleAfter.capsuleWallet,
      pinProofHash:
        capsuleAfter.pinProofHash
    }
  )

  console.log(
    "Anti-Phishing Code 2020 saved to Capsule #1"
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})