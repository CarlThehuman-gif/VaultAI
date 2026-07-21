const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.deployContract("VaultAI");

  await contract.waitForDeployment();

  console.log(
    `VaultAI deployed to ${contract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
