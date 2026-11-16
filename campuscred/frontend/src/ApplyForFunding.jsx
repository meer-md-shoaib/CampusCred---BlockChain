import { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import {
  CONTRACT_ADDRESSES,
  documentRegistryAbi,
  fundingApplicationAbi,
  studentRegistryAbi,
} from "./contracts";
import DocumentUpload from "./DocumentUpload";

export default function ApplyForFunding({ signer, provider, address, onApplicationSubmitted }) {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [documentCid, setDocumentCid] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [amount, setAmount] = useState("300");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isRegistered, setIsRegistered] = useState(false);

  function handleDocumentReady(document) {
    setDocumentCid(document?.cid || "");
    setDocumentHash(document?.documentHash || "");
  }

  useEffect(() => {
    if (address && provider) {
      checkRegistration();
    }
  }, [address, provider]);

  async function checkRegistration() {
    try {
      const activeProvider = provider || new BrowserProvider(window.ethereum);
      const registry = new Contract(
        CONTRACT_ADDRESSES.studentRegistry,
        studentRegistryAbi,
        activeProvider
      );
      const reg = await registry.isStudentRegistered(address);
      setIsRegistered(reg);
    } catch (err) {
      console.error(err);
    }
  }

  async function submitApplication() {
    if (!title.trim() || !reason.trim() || !documentCid.trim() || !documentHash || !amount) {
      setMessage("Please fill in every required field.");
      setMessageType("error");
      return;
    }

    if (Number(amount) <= 0) {
      setMessage("Amount must be greater than 0 CRED.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("Preparing transaction with 18 decimal CRED token precision...");
      setMessageType("info");

      let activeSigner = signer;
      if (!activeSigner && window.ethereum) {
        const prov = new BrowserProvider(window.ethereum);
        activeSigner = await prov.getSigner();
      }

      const fundingContract = new Contract(
        CONTRACT_ADDRESSES.fundingApplication,
        fundingApplicationAbi,
        activeSigner
      );

      const documentRegistryContract = new Contract(
        CONTRACT_ADDRESSES.documentRegistry,
        documentRegistryAbi,
        activeSigner
      );

      // Fix decimals: Convert CRED amount to 18 decimal wei
      const parsedAmount = parseUnits(amount.toString(), 18);

      setMessage("Registering document hash on-chain...");
      const documentIsRegistered =
        await documentRegistryContract.isDocumentRegistered(documentHash);

      if (documentIsRegistered) {
        const [registeredCid, documentOwner] =
          await documentRegistryContract.getDocument(documentHash);
        const signerAddress = await activeSigner.getAddress();

        if (
          registeredCid !== documentCid.trim() ||
          documentOwner.toLowerCase() !== signerAddress.toLowerCase()
        ) {
          throw new Error(
            "This document hash is already registered to a different owner or CID."
          );
        }
      } else {
        const registrationTx = await documentRegistryContract.registerDocument(
          documentHash,
          documentCid.trim()
        );
        await registrationTx.wait();
      }

      setMessage("Submitting funding application to the blockchain...");
      const tx = await fundingContract.submitApplication(
        title.trim(),
        reason.trim(),
        documentCid.trim(),
        documentHash,
        parsedAmount
      );

      setMessage("Transaction sent! Awaiting blockchain confirmation...");
      await tx.wait();

      setMessage("Application submitted successfully! It is now visible to faculty reviewers.");
      setMessageType("success");
      setTitle("");
      setReason("");
      setAmount("300");
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message || "Failed to submit application");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <div>
          <h2>Apply for Student Funding</h2>
          <p className="subtitle">
            Submit an academic grant proposal. Multi-party faculty approval (2 of 2) required for disbursement.
          </p>
        </div>
        <span className="panel-badge">Grant Request</span>
      </div>

      {!isRegistered && (
        <div className="alert alert-warning" style={{ marginBottom: "20px" }}>
          ⚠️ Notice: Your connected wallet ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "None"}) is not yet registered in the Student Registry. Please register on the "Student" tab first, or switch to the pre-registered student profile.
        </div>
      )}

      <div className="form-container">
        <div className="form-group">
          <label>Proposal Title</label>
          <input
            className="cyber-input"
            type="text"
            placeholder="e.g. GPU Compute Credits for AI Thesis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Reason / Academic Justification</label>
          <textarea
            className="cyber-input"
            rows="4"
            placeholder="Detailed academic justification and budget breakdown..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Requested Amount (CRED Tokens)</label>
          <div className="input-with-affix">
            <input
              className="cyber-input"
              type="number"
              min="1"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
            <span className="input-affix">CRED</span>
          </div>
          <span className="helper-text">Disbursed with full 18-decimal token precision</span>
        </div>

        <div className="form-group">
          <label htmlFor="document-cid">Supporting Document IPFS CID</label>
          <input
            id="document-cid"
            className="cyber-input mono-font"
            type="text"
            placeholder="Enter an IPFS CID or upload a document below"
            value={documentCid}
            onChange={(event) => setDocumentCid(event.target.value)}
            disabled={loading}
          />
          {documentCid && (
            <span className="helper-text">
              <a
                href={`https://ipfs.io/ipfs/${documentCid}`}
                target="_blank"
                rel="noreferrer"
                className="inline-link"
              >
                Inspect IPFS Gateway Preview ↗
              </a>
            </span>
          )}
        </div>

        <DocumentUpload onDocumentReady={handleDocumentReady} signer={signer} />

        <button
          className="primary-button large"
          onClick={submitApplication}
          disabled={loading || !isRegistered}
        >
          {loading ? "Submitting to Blockchain..." : "Submit Application for Dual-Review"}
        </button>

        {message && (
          <div className={`alert alert-${messageType}`} style={{ marginTop: "20px" }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}