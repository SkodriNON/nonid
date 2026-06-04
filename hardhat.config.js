require("@nomiclabs/hardhat-ethers")
require("dotenv").config()

const PRIVATE_KEY =
  process.env.OPERATOR_PRIVATE_KEY || ""

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: true,
            runs: 1
          }
        }
      },
      {
        version: "0.8.34",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: true,
            runs: 1
          }
        }
      }
    ]
  },

  networks: {
    arbitrumSepolia: {
      url: "https://arbitrum-sepolia.drpc.org",
      accounts: PRIVATE_KEY
        ? [
            PRIVATE_KEY.startsWith("0x")
              ? PRIVATE_KEY
              : `0x${PRIVATE_KEY}`
          ]
        : []
    }
  }
}