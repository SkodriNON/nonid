
import { NextResponse }
from "next/server"

import { ethers }
from "ethers"

/* ABI */

const ABI = [

  "function createIdentity(string memory username) public"
]

/* ENV VALIDATION */

const RPC_URL =
  process.env
    .NEXT_PUBLIC_RPC_URL

const PRIVATE_KEY =
  process.env
    .PRIVATE_KEY

const CONTRACT_ADDRESS =
  process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS

if (
  !RPC_URL ||
  !PRIVATE_KEY ||
  !CONTRACT_ADDRESS
) {

  throw new Error(
    "Missing environment variables."
  )
}

/* PROVIDER */

const provider =
  new ethers.providers.JsonRpcProvider(
    RPC_URL
  )

/* SERVER WALLET */

const wallet =
  new ethers.Wallet(

    PRIVATE_KEY,

    provider
  )

/* CONTRACT */

const contract =
  new ethers.Contract(

    CONTRACT_ADDRESS,

    ABI,

    wallet
  )

export async function POST(
  req: Request
) {

  try {

    /* BODY */

    const body =
      await req.json()

    const {
      username
    } = body

    /* VALIDATION */

    if (
      !username ||
      typeof username !==
        "string"
    ) {

      return NextResponse.json({

        success: false,

        error:
          "Invalid username."
      })
    }

    const cleanUsername =
      username
        .trim()
        .slice(0, 32)

    /* USERNAME FORMAT */

    const valid =
      /^[a-zA-Z0-9_]+$/
        .test(cleanUsername)

    if (!valid) {

      return NextResponse.json({

        success: false,

        error:
          "Username format invalid."
      })
    }

    /* TX */

    const tx =
      await contract.createIdentity(

        cleanUsername,

        {

          gasLimit:
            300000
        }
      )

    /* WAIT */

    await tx.wait()

    return NextResponse.json({

      success: true,

      txHash:
        tx.hash
    })

  } catch (error) {

    console.error(
      "MINT API ERROR:",
      error
    )

    return NextResponse.json({

      success: false,

      error:
        "Identity mint failed."
    })
  }
}

