
export const APP = {

  /* CORE */

  name:
    "NexusnΩn.id",

  symbol:
    "NON",

  description:
    "Universal Sovereign Identity Infrastructure",

  /* NETWORK */

  network:
    "Arbitrum",

  chainId:

    Number(

      process.env
        .NEXT_PUBLIC_CHAIN_ID
    ),

  rpcUrl:

    process.env
      .NEXT_PUBLIC_RPC_URL,

  /* CONTRACT */

  contractAddress:

    process.env
      .NEXT_PUBLIC_CONTRACT_ADDRESS,

  /* APPLICATION */

  appUrl:

    process.env
      .NEXT_PUBLIC_APP_URL,

  /* NFT */

  nftName:
    "NON Constitutional Identity",

  nftSymbol:
    "NONI",

  /* AI */

  assistants: [

    "NΩNI",

    "NΩNA"
  ],

  /* STORAGE */

  storage: {

    trusted:
      "non_trusted",

    session:
      "non_session",

    history:
      "non_history",

    identity:
      "non_identity"
  }
}

