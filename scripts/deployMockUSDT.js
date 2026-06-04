const {
  ethers
} =
  require("hardhat")

async function main() {

  const MockUSDT =
    await ethers.getContractFactory(
      "MockUSDT"
    )

  const mockUSDT =
    await MockUSDT.deploy()

  await mockUSDT.deployed()

  console.log(
    "MOCK_USDT_ADDRESS:",
    mockUSDT.address
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