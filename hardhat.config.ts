
require("@nomiclabs/hardhat-ethers")
require("dotenv").config()

module.exports = {

  solidity: {

    version: "0.8.28",

    settings: {

      evmVersion: "cancun"
    }
  },

  networks: {

    arbitrumSepolia: {

      url:
        process.env.RPC_URL,

      accounts: [

        process.env.PRIVATE_KEY
      ]
    }
  }
}

