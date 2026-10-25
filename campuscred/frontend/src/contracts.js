import { Contract } from "ethers";

export const CONTRACT_ADDRESSES = {
  campusToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  studentRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  fundingApplication: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
};

export const studentRegistryAbi = [
  "function registerStudent(string studentId, string name, string department)",
  "function students(address) view returns (string studentId, string name, string department, bool isRegistered, bool isVerified)",
  "function isStudentRegistered(address student) view returns (bool)",
];

export const fundingApplicationAbi = [
  "function addReviewer(address reviewer)",
  "function submitApplication(string title, string reason, string documentCid, uint256 amount)",
  "function approveApplication(uint256 applicationId)",
  "function rejectApplication(uint256 applicationId)",
  "function disburseFunds(uint256 applicationId)",
  "function getApplicationDetails(uint256 applicationId) view returns (uint256 id, address student, string title, string reason, string documentCid, uint256 amount, uint8 status, uint256 approvalCount)",
];

export const campusTokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];