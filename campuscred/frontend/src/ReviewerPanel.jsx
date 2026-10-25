import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import {
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
} from "./contracts";

export default function ReviewerPanel() {
  const [applicationId, setApplicationId] = useState("1");
  const [message, setMessage] = useState("");

  async function approveApplication() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const fundingContract = new Contract(
        CONTRACT_ADDRESSES.fundingApplication,
        fundingApplicationAbi,
        signer
      );

      setMessage("Confirm approval in MetaMask...");

      const tx = await fundingContract.approveApplication(applicationId);
      await tx.wait();

      setMessage(
        `Application #${applicationId} approved by the connected reviewer.`
      );
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Reviewer Panel</h2>

      <input
        type="number"
        min="1"
        placeholder="Application ID"
        value={applicationId}
        onChange={(event) => setApplicationId(event.target.value)}
        style={{ width: "250px", padding: "8px" }}
      />

      <br /><br />

      <button onClick={approveApplication}>
        Approve Application
      </button>

      <p>{message}</p>
    </div>
  );
}