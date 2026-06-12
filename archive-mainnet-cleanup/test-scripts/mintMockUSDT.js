const {
  ethers
} =
  require("hardhat")

const MOCK_USDT =
  "0x8556Be98Bb21B1FE2Bc50EF0204ebFC73cC14897"

const CAPSULE_WALLET =
  "0xCe1030AF34Dc640cC2ecc0CA2395460f5F972394"

async function main() {

  const usdt =
    await ethers.getContractAt(
      "MockUSDT",
      MOCK_USDT
    )

  const amount =
    ethers.utils.parseUnits(
      "10",
      6
    )

  const tx =
    await usdt.mint(
      CAPSULE_WALLET,
      amount
    )

  console.log(
    "MINT USDT TX:",
    tx.hash
  )

  await tx.wait()

  console.log(
    "MINTED 10 mUSDT TO:",
    CAPSULE_WALLET
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