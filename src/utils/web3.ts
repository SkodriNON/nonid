
import {
  ethers
} from "ethers"

/* RPC */

export const RPC_URL =

  process.env
    .NEXT_PUBLIC_RPC_URL ||

  "https://arb1.arbitrum.io/rpc"

/* PROVIDER */

export const provider =

  new ethers.providers
    .JsonRpcProvider(

      RPC_URL
    )

/* CONNECT WALLET */

export const connectWallet =
  async () => {

    if (
      typeof window ===
      "undefined"
    ) {

      return null
    }

    const ethereum =
      (window as any)
        .ethereum

    if (!ethereum) {

      alert(
        "MetaMask not found"
      )

      return null
    }

    /* REQUEST */

    await ethereum.request({

      method:
        "eth_requestAccounts"
    })

    /* WEB3 PROVIDER */

    const web3Provider =

      new ethers.providers
        .Web3Provider(
          ethereum
        )

    const signer =
      web3Provider
        .getSigner()

    const address =
      await signer.getAddress()

    return {

      address,

      signer,

      provider:
        web3Provider
    }
}

