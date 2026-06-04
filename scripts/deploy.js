
const hre =
  require("hardhat")

async function main() {

  const Capsule =

    await hre.ethers
      .getContractFactory(
        "NexusNONCapsule"
      )

  const capsule =

    await Capsule.deploy()

  await capsule.deployed()

  console.log(
    "\n🚀 NexusnΩn.ID deployed:\n"
  )

  console.log(
    capsule.address
  )
}

main()

.catch((error) => {

  console.error(error)

  process.exitCode = 1
})

