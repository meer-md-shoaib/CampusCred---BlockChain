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

  const DocumentRegistry =
    await ethers.getContractFactory("DocumentRegistry");
  const documentRegistry = await DocumentRegistry.deploy();
  await documentRegistry.waitForDeployment();

  const FundingApplication =
    await ethers.getContractFactory("FundingApplication");
  const funding = await FundingApplication.deploy(
    await token.getAddress(),
    await registry.getAddress(),
    await documentRegistry.getAddress()
  );
  await funding.waitForDeployment();

  const treasuryAmount = 100000n * 10n ** 18n;

  console.log("Funding the CampusCred treasury...");

  const fundTx = await token.transfer(
    await funding.getAddress(),
    treasuryAmount
  );

  await fundTx.wait();

  console.log("Setting up Reviewer 2 authorization...");
  const addRevTx = await funding.addReviewer(reviewer2.address);
  await addRevTx.wait();

  console.log("Registering sample student (Alice Chen)...");
  const regTx = await registry.connect(student).registerStudent(
    "CS-2024-001",
    "Alice Chen",
    "Computer Science"
  );
  await regTx.wait();

  console.log("Submitting sample funding request (500 CRED)...");
  const sampleDocumentCid = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const sampleDocumentHash = ethers.keccak256(
    ethers.toUtf8Bytes("CampusCred sample document")
  );
  const documentTx = await documentRegistry.connect(student).registerDocument(
    sampleDocumentHash,
    sampleDocumentCid
  );
  await documentTx.wait();

  const appTx = await funding.connect(student).submitApplication(
    "Final Year AI Hardware Kit",
    "Funding requested for GPU compute credits and edge-AI kit for final year capstone project.",
    sampleDocumentCid,
    sampleDocumentHash,
    500n * 10n ** 18n
  );
  await appTx.wait();

  console.log("\nContracts deployed and seeded successfully!");
  console.log("CampusToken:", await token.getAddress());
  console.log("StudentRegistry:", await registry.getAddress());
  console.log("DocumentRegistry:", await documentRegistry.getAddress());
  console.log("FundingApplication:", await funding.getAddress());
  console.log("Treasury funded with: 100,000 CRED");
  console.log("Reviewers configured: Admin (Account #0), Reviewer 2 (Account #1)");
  console.log("Student pre-registered: Alice Chen (Account #2) with Application #1 (500 CRED)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});