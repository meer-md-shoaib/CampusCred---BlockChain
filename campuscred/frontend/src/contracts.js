import { Contract } from "ethers";

export const CONTRACT_ADDRESSES = {
  campusToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  studentRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  fundingApplication: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
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
  "function submitApplication(string title, string reason, string documentCid, uint256 amount)",
  "function approveApplication(uint256 applicationId)",
  "function rejectApplication(uint256 applicationId)",
  "function disburseFunds(uint256 applicationId)",
  "function completeApplication(uint256 applicationId)",
  "function getApplicationDetails(uint256 applicationId) view returns (uint256 id, address student, string title, string reason, string documentCid, uint256 amount, uint8 status, uint256 approvalCount)",
  "function getAllApplications() view returns (tuple(uint256 id, address student, string title, string reason, string documentCid, uint256 amount, uint8 status, uint256 approvalCount, bool exists)[])",
  "function hasApproved(uint256 applicationId, address reviewer) view returns (bool)",
];

export const campusTokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
];