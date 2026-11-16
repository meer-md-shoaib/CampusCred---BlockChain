import { useState } from "react";

function SecurityAuditPanel({ documentRegistryContract, fundingContract }) {
  const [applicationId, setApplicationId] = useState("");
  const [auditData, setAuditData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAuditTrail() {
    try {
      setError("");
      setIsLoading(true);
      setAuditData(null);

      if (!applicationId) {
        throw new Error("Please enter an application ID.");
      }
      if (!fundingContract || !documentRegistryContract) {
        throw new Error("Blockchain contracts are not connected.");
      }

      const details =
        await fundingContract.getApplicationDetails(applicationId);
      const documentHash = details[5];
      const document = await documentRegistryContract.getDocument(
        documentHash
      );
      const documentExists = document[4];

      setAuditData({
        applicationId: details[0].toString(),
        documentHash,
        documentVerified: details[6],
        approvalCount: Number(details[9]),
        status: Number(details[8]),
        ipfsCid: documentExists ? document[1] : "",
        documentOwner: documentExists ? document[2] : "",
        uploadedAt: documentExists
          ? new Date(Number(document[3]) * 1000).toLocaleString()
          : "Not registered",
      });
    } catch (err) {
      setError(
        err?.shortMessage || err?.message || "Unable to load audit trail."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusLabel(status) {
    return (
      ["Submitted", "Under Review", "Approved", "Rejected", "Disbursed", "Completed"][
        status
      ] || "Unknown"
    );
  }

  return (
    <section className="security-audit">
      <h2>Security Audit Trail</h2>
      <p>
        Enter an application ID to view its cryptographic security record,
        document integrity proof, IPFS storage reference, and approval status.
      </p>

      <div className="audit-input">
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Application ID"
          value={applicationId}
          onChange={(event) => setApplicationId(event.target.value)}
        />
        <button
          type="button"
          onClick={loadAuditTrail}
          disabled={isLoading}
        >
          {isLoading ? "Loading Audit..." : "Load Security Audit"}
        </button>
      </div>

      {error && <div className="status-message error">{error}</div>}

      {auditData && (
        <div className="audit-result">
          <p className="audit-label">CAMPUSCRED 2.0 SECURITY AUDIT</p>

          <div className="audit-grid">
            <div className="audit-item">
              <span>Application ID</span>
              <strong>{auditData.applicationId}</strong>
            </div>
            <div className="audit-item">
              <span>Document Integrity</span>
              <strong>
                {auditData.documentVerified ? "Verified" : "Not Verified"}
              </strong>
            </div>
            <div className="audit-item">
              <span>Encryption</span>
              <strong>AES-256-GCM</strong>
            </div>
            <div className="audit-item">
              <span>Decentralized Storage</span>
              <strong>IPFS</strong>
            </div>
            <div className="audit-item">
              <span>Document Owner</span>
              <strong>{auditData.documentOwner || "Not registered"}</strong>
            </div>
            <div className="audit-item">
              <span>Uploaded At</span>
              <strong>{auditData.uploadedAt}</strong>
            </div>
            <div className="audit-item">
              <span>Approvals</span>
              <strong>{auditData.approvalCount} / 2</strong>
            </div>
            <div className="audit-item">
              <span>Application Status</span>
              <strong>{getStatusLabel(auditData.status)}</strong>
            </div>
          </div>

          <div className="audit-hash">
            <span>SHA-256 Document Hash</span>
            <p>{auditData.documentHash}</p>
          </div>
          <div className="audit-hash">
            <span>IPFS CID</span>
            <p>{auditData.ipfsCid || "Not registered"}</p>
          </div>
          <div
            className={`security-status ${
              auditData.documentVerified ? "verified" : "unverified"
            }`}
          >
            {auditData.documentVerified
              ? "Document integrity verified and securely linked to the funding application."
              : "Document is not verified. Disbursement is not permitted."}
          </div>
        </div>
      )}
    </section>
  );
}

export default SecurityAuditPanel;
