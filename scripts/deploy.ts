
const hre =
  require("hardhat")

async function main() {

  const NONIdentity =
    await hre.ethers.getContractFactory(
      "NONGenesisNFT"
    )

  const contract =
    await NONIdentity.deploy()

  await contract.deployed()

  console.log(
    "NONIdentity deployed to:",
    contract.address
  )
}

main().catch((error) => {

  console.error(error)

  process.exit(1)
})

