# CampusCred 2.0 — Secure Blockchain-Based Student Funding System

CampusCred 2.0 is a decentralized application (dApp) that enables students to request financial support for academic needs and receive CampusCred (CRED) tokens after a secure, cryptographically verified approval process.

The project protects academic documents using SHA-256 hashing, AES-256-GCM encryption, IPFS decentralized storage, and blockchain-based integrity verification. Reviewers digitally sign their approvals using MetaMask, and CRED tokens are disbursed only after two valid approvals and successful document verification.

The project is built with Solidity smart contracts, Hardhat, MetaMask, Ethers.js, React, Vite, and IPFS. It demonstrates blockchain and cryptography concepts including wallet-based identity, document integrity, confidential storage, digital signatures, role-based authorization, multi-party approval, transparent records, and on-chain fund disbursement.

---

## 🚀 Features

- **Wallet-based authentication** using MetaMask
- **Student registration** with student ID, name, and department
- **Secure document upload** with SHA-256 integrity hashing
- **AES-256-GCM encryption** for document confidentiality
- **Encrypted document storage** on IPFS
- **On-chain document registration** of SHA-256 hash and IPFS CID
- **Document integrity verification** before fund disbursement
- **Reviewer digital signature approval** using MetaMask
- **Dual-review approval workflow** requiring two authorized approvals
- **CRED token disbursement** directly to the student’s wallet
- **Application tracking and security audit trail**
- **Cyberpunk-inspired responsive React UI**
- **Local blockchain deployment** using Hardhat

---

## 🧠 Problem Statement

Traditional student financial-support systems can be slow, opaque, and dependent on centralized intermediaries. Students may lack a verifiable record of their requests, reviewers may not have a transparent approval trail, and fund disbursement can involve manual reconciliation.

CampusCred 2.0 addresses these issues by recording student identities, encrypted document references, SHA-256 integrity hashes, reviewer digital signatures, approval decisions, and token disbursements on an Ethereum-compatible blockchain. The system improves transparency, accountability, confidentiality, and traceability while allowing students to retain control of their wallets and receive funds directly.

---

## 🔐 Cryptography Used

| Security Property | Cryptographic Mechanism | Implementation |
|---|---|---|
| Document Integrity | SHA-256 hashing | Generates a unique hash for every uploaded document |
| Confidentiality | AES-256-GCM encryption | Encrypts documents before IPFS upload |
| Authenticity | ECDSA digital signature | Reviewer signs approval using MetaMask |
| Non-repudiation | Digital signature | Reviewer cannot deny an approval |
| Tamper Detection | SHA-256 comparison | Modified documents produce a different hash |
| Decentralized Storage | IPFS | Stores only the encrypted document |
| Blockchain Integrity | Smart contracts | Stores document hash, CID, approvals, and disbursement |
| Access Control | Smart-contract roles | Separates student, reviewer, and admin permissions |

---

## ⚙️ Technology Stack

| Category | Technology |
|---|---|
| Blockchain | Ethereum / EVM |
| Smart Contracts | Solidity |
| Development Framework | Hardhat |
| Wallet | MetaMask |
| Frontend | React |
| Build Tool | Vite |
| Blockchain Library | Ethers.js |
| Off-Chain Storage | IPFS |
| Cryptographic Hashing | SHA-256 |
| Symmetric Encryption | AES-256-GCM |
| Digital Signatures | ECDSA |
| Styling | CSS |

---

## 🏗️ System Architecture

CampusCred 2.0 consists of four main layers:

1. **Presentation Layer** — React frontend for students, reviewers, and administrators  
2. **Cryptography Layer** — SHA-256 hashing and AES-256-GCM encryption  
3. **Blockchain Interaction Layer** — MetaMask and Ethers.js  
4. **Smart-Contract Layer** — CampusToken, StudentRegistry, DocumentRegistry, and FundingApplication  

### Smart Contracts

| Contract | Purpose |
|---|---|
| `CampusToken` | ERC-20-compatible CRED token used for funding |
| `StudentRegistry` | Stores verified student identities |
| `DocumentRegistry` | Stores SHA-256 document hash, IPFS CID, owner, and timestamp |
| `FundingApplication` | Manages applications, reviewer signatures, approvals, and disbursement |

---

## 🔐 Security Workflow

```text
Student uploads document
        ↓
SHA-256 hash generated
        ↓
AES-256-GCM encryption
        ↓
Encrypted document uploaded to IPFS
        ↓
MetaMask approval: Register Secure Document
        ↓
SHA-256 hash and IPFS CID stored on blockchain
        ↓
Funding application submitted
        ↓
Reviewer verifies document hash
        ↓
Reviewer digitally signs approval
        ↓
Second reviewer signs approval
        ↓
Admin disburses CRED tokens
        ↓
Security audit trail displayed
```

---

## 📁 Project Structure

```text
CampusCred---BlockChain/
│
├── contracts/
│   ├── CampusToken.sol
│   ├── StudentRegistry.sol
│   ├── DocumentRegistry.sol
│   └── FundingApplication.sol
│
├── scripts/
│   └── deploy.js
│
├── backend/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── connectWallet.js
│   │   ├── contracts.js
│   │   ├── crypto.js
│   │   ├── ipfs.js
│   │   ├── RegisterStudent.jsx
│   │   ├── DocumentUpload.jsx
│   │   ├── ApplyForFunding.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── ReviewerPanel.jsx
│   │   ├── ApplicationTracker.jsx
│   │   └── SecurityAuditPanel.jsx
│   └── package.json
│
├── docs/
├── hardhat.config.ts
├── package.json
└── README.md
```

> Your actual folder names may differ slightly depending on your implementation.

---

## 🛠️ Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) version 18 or later
- [MetaMask browser extension](https://metamask.io/)
- [Git](https://git-scm.com/)
- Visual Studio Code or another code editor
- Pinata account for IPFS storage

---

## 📥 Installation

### 1. Clone the repository

```bash
git clone [https://github.com/meer-md-shoaib/CampusCred---BlockChain.git](https://github.com/meer-md-shoaib/CampusCred---BlockChain.git)
cd CampusCred---BlockChain
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install upload server dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 🔧 Running the Project

Use **four terminals**.

### Terminal 1 — Start the local blockchain

```bash
npx hardhat node
```

Keep this terminal running. Hardhat exposes a local JSON-RPC server at:

```text
http://127.0.0.1:8545/
```

### Terminal 2 — Compile and deploy contracts

Open a second terminal:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

After successful deployment, copy the displayed contract addresses.

### Terminal 3 — Start the secure upload server

Open a third terminal:

```bash
cd backend
npm start
```

The upload server handles IPFS uploads and keeps the Pinata JWT secure on the server side.

### Terminal 4 — Start the React frontend

Open a fourth terminal:

```bash
cd frontend
npm run dev
```

Open the URL shown in the terminal, usually:

```text
http://localhost:5173
```

---

## 🦊 MetaMask Setup

1. Install the MetaMask browser extension.
2. Create or import a wallet.
3. Add a custom network:

| Setting | Value |
|---|---|
| Network Name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | `ETH` |

4. Import a Hardhat test account using its private key.
5. Connect MetaMask to the CampusCred frontend.

> ⚠️ Never use real funds or private keys from a production wallet with a development project.

---

## 📝 How to Use CampusCred 2.0

### 1. Register a Student

Using the first MetaMask account:

```text
Student ID: STU001
Name: Your Name
Department: CSE
```

Click **Register Student** and confirm the MetaMask transaction.

### 2. Upload and Register a Secure Document

Upload a PDF, PNG, JPG, or TXT document.

The system will:

1. Generate a SHA-256 hash.
2. Encrypt the document using AES-256-GCM.
3. Upload only the encrypted document to IPFS.
4. Display the IPFS CID.
5. Register the SHA-256 hash and CID on the blockchain.

Click **Register Secure Document** and confirm the MetaMask transaction.

### 3. Submit a Funding Application

```text
Title: Laptop Support
Reason: I need a laptop for blockchain project development.
Amount: 100
```

Click **Submit Funding Application** and confirm the MetaMask transaction.

The application is linked to the registered document hash and IPFS CID.

### 4. Add a Reviewer

Using the admin account, add a reviewer wallet address:

```text
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### 5. Approve the Application

Use the first reviewer account to approve:

```text
Application ID: 1
```

MetaMask will ask the reviewer to sign an approval message before the approval transaction is submitted.

Then switch to the second reviewer account and approve the same application again.

### 6. Disburse Funds

Using the admin account:

```text
Application ID: 1
```

Click **Disburse Funds**.

The student receives **100 CRED** tokens only after:

- The document is verified on-chain
- Two different reviewers have approved
- The application status is Approved

### 7. Track the Application

Enter:

```text
Application ID: 1
```

Click **Load Application**.

Expected result:

```text
Status: Disbursed
Approvals: 2 / 2
Document Verified: Yes
Requested Amount: 100 CRED
```

### 8. View Security Audit Trail

Enter:

```text
Application ID: 1
```

Click **Load Security Audit**.

The audit panel displays:

```text
Document Integrity: Verified
Encryption: AES-256-GCM
Decentralized Storage: IPFS
Approvals: 2 / 2
Application Status: Disbursed
SHA-256 Document Hash
IPFS CID
Document Owner
Upload Timestamp
```

---

## 📌 Important Notes

- Hardhat local blockchain data resets when the node is stopped.
- After every fresh Hardhat node restart, contracts must be deployed again.
- Update the contract addresses in `frontend/src/contracts.js` after every new deployment.
- The Pinata JWT must be stored only in the backend `.env` file.
- Do not commit `node_modules`, `artifacts`, `cache`, `.env`, `backend/.env`, or private keys.
- The current version is intended for local development and academic demonstration.

---

## 🧪 Testing

To compile the contracts:

```bash
npx hardhat compile
```

To run tests, if test files are available:

```bash
npx hardhat test
```

The application has been validated through an end-to-end demonstration covering:

- Document upload
- SHA-256 hash generation
- AES-256-GCM encryption and decryption
- Encrypted IPFS upload
- On-chain document registration
- Funding application submission
- Reviewer digital signature approval
- Dual-review approval
- Verified-document disbursement
- Application tracking and security audit trail

---

## 🔮 Future Enhancements

- Deploy to Sepolia or another Ethereum testnet
- Add direct IPFS file upload from the frontend using signed upload URLs
- Add email and push notifications
- Implement decentralized reviewer selection
- Add comprehensive automated tests
- Add role-based dashboards and analytics
- Support multiple funding categories
- Add blockchain explorer integration
- Implement advanced key-recovery mechanisms

---

## 👥 Team

CampusCred 2.0 was developed as a team project for the **Foundations of Blockchain Technology** course.

| Role | Responsibility |
|---|---|
| Blockchain Developer | Smart contracts and deployment |
| Frontend Developer | React UI and wallet integration |
| Backend / Integration Developer | Ethers.js, IPFS upload API, and contract interaction |
| Cryptography Developer | SHA-256, AES-256-GCM, and digital signatures |
| UI/UX Developer | Interface design and responsiveness |
| Documentation Lead | SRS, README, testing, and presentation |


---
## Team Members are: 
### Meer Mohammed Shoaib
### Mohommed Adil
### Nihaal R
### Shreyas Bharadwaj
### Praveen Vaddar
### Yogesh Gowda M C
### Gowtham Selvaraj 

---
## 📄 License

This project is created for educational purposes and as Blockchain mini project part of a blockchain technology course.
