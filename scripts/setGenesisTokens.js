const {
  ethers
} =
  require("hardhat")

const GENESIS =
  "0x44f60f192dB31eb51E3dA41042929bF6F65F3898"

const MOCK_USDT =
  "0x8556Be98Bb21B1FE2Bc50EF0204ebFC73cC14897"

const ZERO =
  "0x0000000000000000000000000000000000000000"

async function main() {

  const genesis =
    await ethers.getContractAt(
      "NexusNONGenesis",
      GENESIS
    )

  const tx =
    await genesis.setTokens(
      MOCK_USDT,
      ZERO
    )

  console.log(
    "SET TOKENS TX:",
    tx.hash
  )

  await tx.wait()

  console.log(
    "GENESIS_USDT_SET:",
    MOCK_USDT
  )
}

main()
  .then(() =>
    process.exit(0)
  )
  .catch((error) => {

    console.error(error)

    process.exit(1)

  })