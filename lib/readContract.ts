
import {
  ethers
} from "ethers"

/* ABI */

const ABI = [

  "function getIdentity(uint256 nftId) external view returns(uint256,string memory,uint256,bool,uint256,uint256)",

  "function internalBalance(uint256 nftId) external view returns(uint256)",

  "function sessionActive(uint256 nftId) external view returns(bool)"
]

export async function readIdentity(

  nftId: number

) {

  if (
    typeof window ===
      "undefined"
  ) {

    throw new Error(
      "Window unavailable"
    )
  }

  if (
    !(window as any)
      .ethereum
  ) {

    throw new Error(
      "MetaMask not installed"
    )
  }

  /* CONNECT */

  await (
    window as any
  ).ethereum.request({

    method:
      "eth_requestAccounts"
  })

  /* PROVIDER */

  const provider =
    new ethers.providers.Web3Provider(

      (window as any)
        .ethereum
    )

  /* CONTRACT */

  const contract =
    new ethers.Contract(

      process.env
        .NEXT_PUBLIC_CONTRACT_ADDRESS!,

      ABI,

      provider
    )

  /* READ */

  const identity =
    await contract.getIdentity(
      nftId
    )

  return {

    nftId:
      identity[0]
        .toString(),

    noniId:
      identity[1],

    createdAt:
      identity[2]
        .toString(),

    active:
      identity[3],

    nonce:
      identity[4]
        .toString(),

    balance:
      identity[5]
        .toString()
  }
}

