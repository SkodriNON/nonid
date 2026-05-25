
import {
  ethers
} from "ethers"

import {
  getProvider
} from "./web3"

/* ABI */

const ABI = [

  "function createIdentity(string memory noniId,string memory password) external",

  "function login(uint256 nftId,string memory password) external",

  "function logout(uint256 nftId) external",

  "function getIdentity(uint256 nftId) external view returns(uint256,string memory,uint256,bool,uint256,uint256)",

  "function transferInternal(uint256 fromId,uint256 toId,uint256 amount) external",

  "function mintTestBalance(uint256 nftId,uint256 amount) external",

  "function internalBalance(uint256 nftId) view returns(uint256)",

  "function sessionActive(uint256 nftId) view returns(bool)"
]

/* READ CONTRACT */

export async function getContract() {

  const provider =
    await getProvider()

  return new ethers.Contract(

    process.env
      .NEXT_PUBLIC_CONTRACT_ADDRESS!,

    ABI,

    provider
  )
}

/* WRITE CONTRACT */

export async function getSignerContract() {

  const provider =
    await getProvider()

  const signer =
    provider.getSigner()

  return new ethers.Contract(

    process.env
      .NEXT_PUBLIC_CONTRACT_ADDRESS!,

    ABI,

    signer
  )
}

