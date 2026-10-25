import { useState } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import {
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
  campusTokenAbi,
} from "./contracts";

const statusNames = [
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
  "Disbursed",
  "Completed",
];

export default function ApplicationTracker() {
  const [applicationId, setApplicationId] = useState("1");
  const [application, setApplication] = useState(null);
  const [tokenBalance, setTokenBalance] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("CRED");
  const [message, setMessage] = useState("");

  async function loadApplication() {
    try {
      setMessage("Loading application data from blockchain...");

      const provider = new BrowserProvider(window.ethereum);

      const fundingContract = new Contract(
        CONTRACT_ADDRESSES.fundingApplication,
        fundingApplicationAbi,
        provider
      );

      const tokenContract = new Contract(
        CONTRACT_ADDRESSES.campusToken,
        campusTokenAbi,
        provider
      );

      const data = await fundingContract.getApplicationDetails(applicationId);

      const balance = await tokenContract.balanceOf(data.student);
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();

      setApplication({
        id: data.id.toString(),
        student: data.student,
        title: data.title,
        reason: data.reason,
        documentCid: data.documentCid,
        amount: data.amount.toString(),
        status: Number(data.status),
        approvalCount: data.approvalCount.toString(),
      });

      setTokenBalance(formatUnits(balance, decimals));
      setTokenSymbol(symbol);
      setMessage("Application loaded successfully.");
    } catch (error) {
      setApplication(null);
      setTokenBalance("");
      setMessage(error.reason || error.shortMessage || error.message);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Track Funding Application</h2>

      <input
        type="number"
        min="1"
        placeholder="Application ID"
        value={applicationId}
        onChange={(event) => setApplicationId(event.target.value)}
        style={{ width: "250px", padding: "8px" }}
      />

      <button
        onClick={loadApplication}
        style={{ marginLeft: "10px", padding: "8px 14px" }}
      >
        Load Application
      </button>

      <p>{message}</p>

      {application && (
        <div
          style={{
            border: "1px solid #cccccc",
            borderRadius: "8px",
            padding: "16px",
            maxWidth: "700px",
          }}
        >
          <h3>Application #{application.id}</h3>

          <p><strong>Status:</strong> {statusNames[application.status]}</p>
          <p><strong>Approvals:</strong> {application.approvalCount} / 2</p>
          <p><strong>Student wallet:</strong> {application.student}</p>
          <p><strong>Title:</strong> {application.title}</p>
          <p><strong>Reason:</strong> {application.reason}</p>
          <p><strong>Requested amount:</strong> {application.amount} CRED</p>
          <p><strong>Document CID:</strong> {application.documentCid}</p>
          <p>
            <strong>Student CRED balance:</strong> {tokenBalance} {tokenSymbol}
          </p>
        </div>
      )}
    </div>
  );
}