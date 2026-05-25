
const hre =
  require("hardhat")

async function main() {

  console.log(
    "Deploying NONIdentity..."
  )

  const Factory =
    await hre.ethers.getContractFactory(
      "NONGenesisNFT"
    )

  const contract =
    await Factory.deploy()

  await contract.deployed()

  console.log(
    "Contract deployed to:",
    contract.address
  )
}

main().catch((error) => {

  console.error(error)

  process.exit(1)
})

