import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import {
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
} from "./contracts";

export default function AdminPanel() {
  const [reviewerAddress, setReviewerAddress] = useState("");
  const [applicationId, setApplicationId] = useState("1");
  const [message, setMessage] = useState("");

  async function getFundingContract() {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new Contract(
      CONTRACT_ADDRESSES.fundingApplication,
      fundingApplicationAbi,
      signer
    );
  }

  async function addReviewer() {
    try {
      const fundingContract = await getFundingContract();

      setMessage("Confirm reviewer addition in MetaMask...");
      const tx = await fundingContract.addReviewer(reviewerAddress);
      await tx.wait();

      setMessage("Reviewer added successfully.");
      setReviewerAddress("");
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message);
    }
  }

  async function disburseFunds() {
    try {
      const fundingContract = await getFundingContract();

      setMessage("Confirm token disbursement in MetaMask...");
      const tx = await fundingContract.disburseFunds(applicationId);
      await tx.wait();

      setMessage(
        `CRED tokens were disbursed for application #${applicationId}.`
      );
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Admin Panel</h2>

      <h3>Add Reviewer</h3>

      <input
        type="text"
        placeholder="Reviewer wallet address"
        value={reviewerAddress}
        onChange={(event) => setReviewerAddress(event.target.value)}
        style={{ width: "420px", padding: "8px" }}
      />

      <br /><br />

      <button onClick={addReviewer}>Add Reviewer</button>

      <hr style={{ margin: "25px 0" }} />

      <h3>Disburse Approved Funds</h3>

      <input
        type="number"
        min="1"
        placeholder="Application ID"
        value={applicationId}
        onChange={(event) => setApplicationId(event.target.value)}
        style={{ width: "250px", padding: "8px" }}
      />

      <br /><br />

      <button onClick={disburseFunds}>
        Disburse CRED Tokens
      </button>

      <p>{message}</p>
    </div>
  );
}