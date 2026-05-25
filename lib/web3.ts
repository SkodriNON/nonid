
import {
  ethers
} from "ethers"

export async function getProvider() {

  if (
    typeof window !==
      "undefined" &&

    (window as any)
      .ethereum
  ) {

    return new ethers.providers.Web3Provider(

      (window as any)
        .ethereum
    )
  }

  return new ethers.providers.JsonRpcProvider(

    process.env
      .NEXT_PUBLIC_RPC_URL
  )
}

