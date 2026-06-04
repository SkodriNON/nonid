const { ethers } = require("hardhat")

async function main() {

  const [deployer] =
    await ethers.getSigners()

  console.log("Deploying with:")
  console.log(deployer.address)

  const balance =
    await deployer.getBalance()

  console.log(
    "Balance:",
    ethers.utils.formatEther(balance),
    "ETH"
  )

  const feeVault =
    process.env.FEE_VAULT || deployer.address

  const usdtToken =
    process.env.USDT_TOKEN || ethers.constants.AddressZero

  const nonToken =
    process.env.NON_TOKEN || ethers.constants.AddressZero

  console.log("Fee Vault:", feeVault)
  console.log("USDT Token:", usdtToken)
  console.log("NON Token:", nonToken)

  const Genesis =
    await ethers.getContractFactory(
      "NexusNONGenesis"
    )

  const genesis =
    await Genesis.deploy(
      feeVault,
      usdtToken,
      nonToken
    )

  await genesis.deployed()

  console.log("")
  console.log("NexusNONGenesis deployed:")
  console.log(genesis.address)

  console.log("")
  console.log("Set this in .env:")
  console.log(
    `NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS=${genesis.address}`
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })