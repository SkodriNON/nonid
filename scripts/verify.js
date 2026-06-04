
require("dotenv").config()

const hre =
  require("hardhat")

async function main() {

  console.log(

    process.env
      .NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS
  )

  await hre.run(

    "verify:verify",

    {
      address:

        process.env
          .NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS
    }
  )

  console.log(
    "\n✅ VERIFIED\n"
  )
}

main()

.catch((error) => {

  console.error(error)

  process.exitCode = 1
})

