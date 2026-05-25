
require("@nomiclabs/hardhat-ethers")
require("dotenv").config()

module.exports = {

  solidity: "0.8.28",

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

