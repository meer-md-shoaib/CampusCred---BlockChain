export const CONTRACT_ADDRESSES = {
  campusToken: "0x4c5859f0F772848b2D91F1D83E2Fe57935348029",
  studentRegistry: "0x1291Be112d480055DaFd8a610b7d1e203891C274",
  documentRegistry: "0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154",
  fundingApplication: "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575",
};

export const DEMO_PROFILES = [
  {
    id: "admin",
    name: "Dean / Admin (Reviewer 1)",
    role: "Admin & Reviewer",
    roleType: "admin",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    description: "Full administrative rights: Disburse approved funds & grant reviewer status.",
    badge: "🛡️ ADMIN",
  },
  {
    id: "reviewer2",
    name: "Prof. Davis (Reviewer 2)",
    role: "Faculty Reviewer",
    roleType: "reviewer",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    description: "Evaluates applications, provides second quorum approval.",
    badge: "✅ REVIEWER",
  },
  {
    id: "student1",
    name: "Alice Chen (Student)",
    role: "Student (Computer Science)",
    roleType: "student",
    studentId: "CS-2024-001",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    description: "Pre-registered student with active funding request #1.",
    badge: "🎓 STUDENT",
  },
  {
    id: "student2",
    name: "Bob Smith (Student)",
    role: "Student (Electrical Eng)",
    roleType: "student",
    studentId: "EE-2024-042",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a450dd53c043247f3175777344596246c40e361488b",
    description: "Unregistered student ready to test fresh registration & application.",
    badge: "🎓 STUDENT",
  },
];

export const STATUS_NAMES = [
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
  "Disbursed",
  "Completed",
];

export const studentRegistryAbi = [
  "function registerStudent(string studentId, string name, string department)",
  "function verifyStudent(address student)",
  "function students(address) view returns (string studentId, string name, string department, bool isRegistered, bool isVerified)",
  "function getStudent(address student) view returns (tuple(string studentId, string name, string department, bool isRegistered, bool isVerified))",
  "function isStudentRegistered(address student) view returns (bool)",
  "function isStudentVerified(address student) view returns (bool)",
  "function getAllStudents() view returns (address[])",
  "function owner() view returns (address)",
];

export const fundingApplicationAbi = [
  "function admin() view returns (address)",
  "function isReviewer(address) view returns (bool)",
  "function requiredApprovals() view returns (uint256)",
  "function addReviewer(address reviewer)",
  "function removeReviewer(address reviewer)",
  "function submitApplication(string title, string reason, string documentCid, bytes32 documentHash, uint256 amount)",
  "function approveApplication(uint256 applicationId, bytes signature)",
  "function rejectApplication(uint256 applicationId)",
  "function disburseFunds(uint256 applicationId)",
  "function completeApplication(uint256 applicationId)",
  "function getApplicationDetails(uint256 applicationId) view returns (uint256 id, address student, string title, string reason, string documentCid, bytes32 documentHash, bool documentVerified, uint256 amount, uint8 status, uint256 approvalCount)",
  "function getAllApplications() view returns (tuple(uint256 id, address student, string title, string reason, string documentCid, bytes32 documentHash, bool documentVerified, uint256 amount, uint8 status, uint256 approvalCount, bool exists)[])",
  "function hasApproved(uint256 applicationId, address reviewer) view returns (bool)",
  "function verifyReviewerSignature(uint256 applicationId, bytes32 documentHash, address reviewer, bytes signature) pure returns (bool)",
];

export const documentRegistryAbi = [
  "function registerDocument(bytes32 documentHash, string ipfsCid)",
  "function verifyDocument(bytes32 documentHash) view returns (bool)",
  "function getDocument(bytes32 documentHash) view returns (bytes32 documentHash, string ipfsCid, address owner, uint256 uploadedAt, bool exists)",
  "function getOwnerDocuments(address owner) view returns (bytes32[])",
];

export const campusTokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
];