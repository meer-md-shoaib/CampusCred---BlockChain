import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import {
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
} from "./contracts";

export default function ApplyForFunding() {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [documentCid, setDocumentCid] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  async function submitApplication() {
    try {
      if (!title || !reason || !documentCid || !amount) {
        setMessage("Please fill in every field.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const fundingContract = new Contract(
        CONTRACT_ADDRESSES.fundingApplication,
        fundingApplicationAbi,
        signer
      );

      setMessage("Confirm the application transaction in MetaMask...");

      const tx = await fundingContract.submitApplication(
        title,
        reason,
        documentCid,
        amount
      );

      await tx.wait();

      setMessage("Funding application submitted successfully.");
      setTitle("");
      setReason("");
      setDocumentCid("");
      setAmount("");
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Apply for Funding</h2>

      <input
        type="text"
        placeholder="Application title (Example: Laptop Support)"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        style={{ width: "350px", padding: "8px" }}
      />

      <br /><br />

      <textarea
        placeholder="Explain why you need funding"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows="4"
        style={{ width: "350px", padding: "8px" }}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Document CID (temporary example: QmExample123)"
        value={documentCid}
        onChange={(event) => setDocumentCid(event.target.value)}
        style={{ width: "350px", padding: "8px" }}
      />

      <br /><br />

      <input
        type="number"
        min="1"
        placeholder="Requested amount in CRED tokens"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        style={{ width: "350px", padding: "8px" }}
      />

      <br /><br />

      <button onClick={submitApplication}>
        Submit Funding Application
      </button>

      <p>{message}</p>
    </div>
  );
}