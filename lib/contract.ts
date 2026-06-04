import {
  ethers
} from "ethers"

declare global {
  interface Window {
    ethereum?: any
  }
}

const CONTRACT_ADDRESS =
  process.env
    .NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS!

const ARBITRUM_SEPOLIA_CHAIN_ID =
  "0x66eee"

const ARBITRUM_SEPOLIA_DECIMAL =
  421614

const ARBITRUM_SEPOLIA_PARAMS = {
  chainId:
    ARBITRUM_SEPOLIA_CHAIN_ID,

  chainName:
    "Arbitrum Sepolia",

  nativeCurrency: {
    name:
      "Ethereum",
    symbol:
      "ETH",
    decimals:
      18
  },

  rpcUrls: [
    "https://sepolia-rollup.arbitrum.io/rpc"
  ],

  blockExplorerUrls: [
    "https://sepolia.arbiscan.io"
  ]
}

export const ABI = [

  "function VERSION() view returns(string)",

  "function createCapsule(bytes32 emailHash,bytes encryptedEmail,bytes encryptedName,uint8 capsuleType) external returns(uint256 capsuleId,address capsuleWallet)",

  "function emailHashToCapsule(bytes32 emailHash) view returns(uint256)",

  "function getCapsuleByEmailHash(bytes32 emailHash) view returns(uint256)",

  "function walletToCapsule(address wallet) view returns(uint256)",

  "function getCapsuleWallet(uint256 capsuleId) view returns(address)",

  "function ownerOf(uint256 tokenId) view returns(address)",

  "function balanceOf(address owner) view returns(uint256)",

  "function tokenURI(uint256 tokenId) view returns(string)",

  "function getCapsule(uint256 capsuleId) view returns(tuple(uint256 id,uint8 capsuleType,uint8 status,address capsuleWallet,bytes32 emailHash,bytes encryptedEmail,bytes encryptedName,bytes32 pinProofHash,bytes32 pukProofHash,bytes32 pupProofHash,uint256 createdAt,uint256 activatedAt,uint256 updatedAt,uint256 nonce))",

  "function hasAuthorization(uint256 capsuleId,bytes32 authorization) view returns(bool)",

  "function activatePUP(uint256 capsuleId,bytes32 pinProofHash,bytes32 pukProofHash,bytes32 pupProofHash,bool payWithNON,uint256 nonAmount) external",

  "function recoverPUP(uint256 capsuleId,bytes32 newPinProofHash,bytes32 newPukProofHash,bytes32 newPupProofHash,bool payWithNON,uint256 nonAmount) external",

  "function lockCapsule(uint256 capsuleId) external",

  "function unlockCapsule(uint256 capsuleId) external"
]

export function hashEmail(
  email: string
) {
  return ethers
    .utils
    .keccak256(
      ethers
        .utils
        .toUtf8Bytes(
          email
            .trim()
            .toLowerCase()
        )
    )
}

export function toBytes(
  value: string
) {
  return ethers
    .utils
    .toUtf8Bytes(value)
}

export async function switchToArbitrumSepolia() {

  if (
    !(window as any)
      .ethereum
  ) {
    throw new Error(
      "Browser wallet not installed"
    )
  }

  try {

    await (window as any)
      .ethereum
      .request({
        method:
          "wallet_switchEthereumChain",

        params: [
          {
            chainId:
              ARBITRUM_SEPOLIA_CHAIN_ID
          }
        ]
      })

  } catch (error: any) {

    if (
      error?.code === 4902
    ) {

      await (window as any)
        .ethereum
        .request({
          method:
            "wallet_addEthereumChain",

          params: [
            ARBITRUM_SEPOLIA_PARAMS
          ]
        })

      return
    }

    throw error
  }
}

export async function getProvider() {

  if (
    !(window as any)
      .ethereum
  ) {
    throw new Error(
      "Browser wallet not installed"
    )
  }

  await switchToArbitrumSepolia()

  const provider =
    new ethers
      .providers
      .Web3Provider(
        (window as any)
          .ethereum,
        "any"
      )

  const network =
    await provider
      .getNetwork()

  if (
    network.chainId !==
    ARBITRUM_SEPOLIA_DECIMAL
  ) {
    throw new Error(
      "Wrong network. Use Arbitrum Sepolia."
    )
  }

  return provider
}

export async function getSigner() {

  const provider =
    await getProvider()

  const accounts =
    await provider.send(
      "eth_requestAccounts",
      []
    )

  if (
    !accounts ||
    accounts.length === 0
  ) {
    throw new Error(
      "No wallet connected"
    )
  }

  return provider.getSigner()
}

export async function getWalletAddress() {

  const signer =
    await getSigner()

  const address =
    await signer.getAddress()

  return ethers
    .utils
    .getAddress(address)
}

export const getContract =
  async (
    signer?: any
  ) => {

    if (
      !CONTRACT_ADDRESS
    ) {
      throw new Error(
        "NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS missing"
      )
    }

    const finalSigner =
      signer ||
      await getSigner()

    return new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      finalSigner
    )
  }

export async function getCapsuleIdForWallet(
  walletAddress: string
) {

  const contract =
    await getContract()

  const capsuleId =
    await contract
      .walletToCapsule(
        walletAddress
      )

  return capsuleId.toString()
}

export async function getCapsuleByEmail(
  email: string
) {

  const contract =
    await getContract()

  const emailHash =
    hashEmail(email)

  const capsuleId =
    await contract
      .emailHashToCapsule(
        emailHash
      )

  return capsuleId.toString()
}