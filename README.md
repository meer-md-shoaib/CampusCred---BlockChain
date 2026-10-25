# CampusCred — Blockchain-Based Student Funding System

CampusCred is a decentralized application (dApp) that allows students to request financial support for academic needs and receive funding through CampusCred (CRED) tokens after a transparent approval process.

The project is built with Solidity smart contracts, Hardhat, MetaMask, Ethers.js, React, and Vite. It demonstrates blockchain concepts such as wallet-based identity, tokenized incentives, role-based authorization, multi-party approval, transparent records, and on-chain fund disbursement.

---

## 🚀 Features

- **Wallet-based authentication** using MetaMask
- **Student registration** with student ID, name, and department
- **Funding application submission** with title, reason, document CID, and requested amount
- **Reviewer management** through an admin panel
- **Dual-review approval workflow** requiring two authorized approvals
- **CRED token disbursement** directly to the student’s wallet
- **Application tracking** with live on-chain status and approval count
- **Cyberpunk-inspired responsive React UI**
- **Local blockchain deployment** using Hardhat

---

## 🧠 Problem Statement

Traditional student financial-support systems can be slow, opaque, and dependent on centralized intermediaries. Students may not have a verifiable record of their requests, reviewers may lack a transparent approval trail, and fund distribution may require manual reconciliation.

CampusCred solves this by recording student identities, funding applications, reviewer decisions, and token disbursements on an Ethereum-compatible blockchain.

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
| Styling | CSS |

---

## 🏗️ System Architecture

CampusCred consists of three main layers:

1. **Presentation Layer** — React frontend for students, reviewers, and administrators  
2. **Blockchain Interaction Layer** — MetaMask and Ethers.js  
3. **Smart-Contract Layer** — CampusToken, StudentRegistry, and FundingApplication  

### Smart Contracts

| Contract | Purpose |
|---|---|
| `CampusToken` | ERC-20-compatible CRED token used for funding |
| `StudentRegistry` | Stores verified student identities |
| `FundingApplication` | Manages applications, approvals, and disbursement |

### Core Workflow

```text
Student Registration
        ↓
Funding Application Submission
        ↓
Reviewer Approval 1
        ↓
Reviewer Approval 2
        ↓
CRED Token Disbursement
        ↓
Application Tracking
```

---

## 📁 Project Structure

```text
CampusCred---BlockChain/
│
├── contracts/
│   ├── CampusToken.sol
│   ├── StudentRegistry.sol
│   └── FundingApplication.sol
│
├── scripts/
│   └── deploy.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── connectWallet.js
│   │   ├── contracts.js
│   │   ├── RegisterStudent.jsx
│   │   ├── ApplyForFunding.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── ReviewerPanel.jsx
│   │   └── ApplicationTracker.jsx
│   └── package.json
│
├── hardhat.config.js
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

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 🔧 Running the Project

Use **three terminals**.

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

### Terminal 3 — Start the React frontend

Open a third terminal:

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

## 📝 How to Use CampusCred

### 1. Register a Student

Using the first MetaMask account:

```text
Student ID: STU001
Name: Your Name
Department: CSE
```

Click **Register Student** and confirm the MetaMask transaction.

### 2. Submit a Funding Application

```text
Title: Laptop Support
Reason: I need a laptop for blockchain project development.
Document CID: QmCampusCredDemoDocument001
Amount: 100
```

Click **Submit Funding Application** and confirm the transaction.

### 3. Add a Reviewer

Using the admin account, add a reviewer wallet address:

```text
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### 4. Approve the Application

Use the first reviewer account to approve:

```text
Application ID: 1
```

Then switch to the second reviewer account and approve the same application again.

### 5. Disburse Funds

Using the admin account:

```text
Application ID: 1
```

Click **Disburse Funds**.

The student receives **100 CRED** tokens.

### 6. Track the Application

Enter:

```text
Application ID: 1
```

Click **Load Application**.

Expected result:

```text
Status: Disbursed
Approvals: 2 / 2
Requested Amount: 100 CRED
```

---

## 📌 Important Notes

- Hardhat local blockchain data resets when the node is stopped.
- After every fresh Hardhat node restart, contracts must be deployed again.
- Update the contract addresses in `frontend/src/contracts.js` after every new deployment.
- Do not commit `node_modules`, `artifacts`, `cache`, `.env`, or private keys.
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

The application has also been validated through an end-to-end demonstration covering registration, application submission, dual approval, disbursement, and tracking.

---

## 🔮 Future Enhancements

- Deploy to Sepolia or another Ethereum testnet
- Direct IPFS file upload from the frontend
- Email and push notifications
- Decentralized reviewer selection
- More comprehensive automated tests
- Role-based dashboards and analytics
- Support for multiple funding categories
- Blockchain explorer integration

---

## 👥 Team

CampusCred was developed as a team project for the **Foundations of Blockchain Technology** course.

| Role | Responsibility |
|---|---|
| Blockchain Developer | Smart contracts and deployment |
| Frontend Developer | React UI and wallet integration |
| Backend / Integration Developer | Ethers.js and contract interaction |
| UI/UX Developer | Interface design and responsiveness |
| Documentation Lead | SRS, README, testing, and presentation |

---

## 📄 License

This project is created for educational purposes as part of a blockchain technology course.
