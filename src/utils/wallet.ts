
export interface WalletState {

  address: string

  balance: string

  chainId: number

  connected: boolean
}

/* DEFAULT */

export const defaultWallet:
  WalletState = {

    address: "",

    balance: "0",

    chainId: 42161,

    connected: false
  }

/* STORAGE */

const STORAGE_KEY =
  "non_wallet"

/* SAVE */

export const saveWallet = (

  wallet: WalletState

) => {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(wallet)
  )
}

/* GET */

export const getWallet =
  (): WalletState => {

    try {

      const wallet =
        localStorage.getItem(
          STORAGE_KEY
        )

      if (!wallet) {

        return defaultWallet
      }

      return JSON.parse(
        wallet
      )

    } catch {

      return defaultWallet
    }
  }

/* CONNECT */

export const connectWallet =
  async () => {

    if (
      !(window as any)
        .ethereum
    ) {

      throw new Error(
        "MetaMask not installed"
      )
    }

    const accounts =
      await (

        window as any
      ).ethereum.request({

        method:
          "eth_requestAccounts"
      })

    const chainId =
      await (

        window as any
      ).ethereum.request({

        method:
          "eth_chainId"
      })

    const wallet: WalletState = {

      address:
        accounts[0],

      balance:
        "0",

      chainId:
        Number(chainId),

      connected:
        true
    }

    saveWallet(wallet)

    return wallet
  }

/* DISCONNECT */

export const disconnectWallet =
  () => {

    localStorage.removeItem(
      STORAGE_KEY
    )
  }

