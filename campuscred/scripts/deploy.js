import hre from "hardhat";

async function main() {
  const connection = await hre.network.getOrCreate();
  const ethers = connection.ethers;

  const [admin, reviewer2, student] = await ethers.getSigners();

  console.log("Deploying CampusCred contracts...");
  console.log("Network: localhost");
  console.log("Admin / Reviewer 1:", admin.address);
  console.log("Reviewer 2:", reviewer2.address);
  console.log("Student:", student.address);

  const CampusToken = await ethers.getContractFactory("CampusToken");
  const token = await CampusToken.deploy();
  await token.waitForDeployment();

  const StudentRegistry =
    await ethers.getContractFactory("StudentRegistry");
  const registry = await StudentRegistry.deploy();
  await registry.waitForDeployment();

  const FundingApplication =
    await ethers.getContractFactory("FundingApplication");
  const funding = await FundingApplication.deploy(
    await token.getAddress(),
    await registry.getAddress()
  );
  await funding.waitForDeployment();

  const treasuryAmount = 100000n * 10n ** 18n;

  console.log("Funding the CampusCred treasury...");

  const fundTx = await token.transfer(
    await funding.getAddress(),
    treasuryAmount
  );

  await fundTx.wait();

  console.log("\nContracts deployed and treasury funded successfully!");
  console.log("CampusToken:", await token.getAddress());
  console.log("StudentRegistry:", await registry.getAddress());
  console.log("FundingApplication:", await funding.getAddress());
  console.log("Treasury funded with: 100000 CRED");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});