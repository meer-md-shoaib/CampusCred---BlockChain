import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import {
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
  STATUS_NAMES,
} from "./contracts";

export default function ReviewerPanel({ signer, provider, address, onReviewAction }) {
  const [applications, setApplications] = useState([]);
  const [isReviewer, setIsReviewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [hasApprovedMap, setHasApprovedMap] = useState({});

  useEffect(() => {
    if (address && provider) {
      loadReviewerData();
    }
  }, [address, provider]);

  async function loadReviewerData() {
    try {
      setLoading(true);
      const activeProvider = provider || new BrowserProvider(window.ethereum);
      const fundingContract = new Contract(
        CONTRACT_ADDRESSES.fundingApplication,
        fundingApplicationAbi,
        activeProvider
      );

      const reviewerStatus = await fundingContract.isReviewer(address);
      setIsReviewer(reviewerStatus);

      const allApps = await fundingContract.getAllApplications();
      
      const formatted = [];
      const approvedMap = {};

      for (const app of allApps) {
        if (!app.exists) continue;
        const id = Number(app.id);
        
        let userApproved = false;
        try {
          userApproved = await fundingContract.hasApproved(id, address);
        } catch (e) {
          userApproved = false;
        }
        approvedMap[id] = userApproved;

        formatted.push({
          id,
          student: app.student,
          title: app.title,
          reason: app.reason,
          documentCid: app.documentCid,
          amount: formatUnits(app.amount, 18),
          status: Number(app.status),
          approvalCount: Number(app.approvalCount),
        });
      }

      setApplications(formatted);
      setHasApprovedMap(approvedMap);
    } catch (err) {
      console.error("Error loading reviewer data:", err);
      setMessage("Failed to load applications from blockchain.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(appId) {
    try {
      setActionLoading(`approve-${appId}`);
      setMessage(`Signing approval for Application #${appId}...`);
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

      const tx = await fundingContract.approveApplication(appId);
      await tx.wait();

      setMessage(`Application #${appId} successfully approved!`);
      setMessageType("success");
      await loadReviewerData();
      if (onReviewAction) onReviewAction();
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message || "Approval transaction failed");
      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(appId) {
    try {
      setActionLoading(`reject-${appId}`);
      setMessage(`Submitting rejection for Application #${appId}...`);
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

      const tx = await fundingContract.rejectApplication(appId);
      await tx.wait();

      setMessage(`Application #${appId} rejected.`);
      setMessageType("warning");
      await loadReviewerData();
      if (onReviewAction) onReviewAction();
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message || "Rejection failed");
      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <div>
          <h2>Faculty Reviewer Portal</h2>
          <p className="subtitle">
            Evaluate academic grant requests. Each application requires 2 independent reviewer approvals.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`status-pill ${isReviewer ? "status-approved" : "status-rejected"}`}>
            {isReviewer ? "✓ Authorized Reviewer" : "✕ Not a Reviewer"}
          </span>
          <button className="ghost-button" onClick={loadReviewerData} disabled={loading}>
            {loading ? "Refreshing..." : "↻ Refresh Feed"}
          </button>
        </div>
      </div>

      {!isReviewer && (
        <div className="alert alert-warning" style={{ marginBottom: "24px" }}>
          ⚠️ Notice: Connected wallet ({address}) is not an authorized reviewer. To review applications, please switch to <strong>Reviewer 1 (Admin)</strong> or <strong>Reviewer 2 (Prof. Davis)</strong> using the Profile Switcher.
        </div>
      )}

      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: "20px" }}>
          {message}
        </div>
      )}

      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="empty-state">
            <p>No funding applications submitted yet.</p>
          </div>
        ) : (
          applications.map((app) => {
            const isSelf = app.student.toLowerCase() === address.toLowerCase();
            const alreadyApproved = hasApprovedMap[app.id];
            const isReviewable = app.status === 0 || app.status === 1; // Submitted or UnderReview
            const isApproved = app.status === 2;
            const isDisbursed = app.status === 4;

            return (
              <div key={app.id} className="application-card">
                <div className="app-card-top">
                  <div className="app-id-title">
                    <span className="app-id-tag">#{app.id}</span>
                    <h3 className="app-title">{app.title}</h3>
                  </div>

                  <div className="app-status-badge-group">
                    <span className={`status-pill status-${STATUS_NAMES[app.status]?.toLowerCase().replace(" ", "-")}`}>
                      {STATUS_NAMES[app.status]}
                    </span>
                    <span className="approval-quorum-pill">
                      Approvals: {app.approvalCount} / 2
                    </span>
                  </div>
                </div>

                <p className="app-reason-text">{app.reason}</p>

                <div className="app-meta-grid">
                  <div>
                    <span className="meta-label">Applicant Wallet</span>
                    <span className="meta-value mono-font">{app.student}</span>
                  </div>
                  <div>
                    <span className="meta-label">Grant Amount</span>
                    <span className="meta-value highlight-cyan">{app.amount} CRED</span>
                  </div>
                  <div>
                    <span className="meta-label">Proof Document CID</span>
                    <a
                      href={`https://ipfs.io/ipfs/${app.documentCid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="meta-value mono-font inline-link"
                    >
                      {app.documentCid.slice(0, 16)}... ↗
                    </a>
                  </div>
                </div>

                <div className="app-card-actions">
                  {alreadyApproved && (
                    <span className="approval-badge-success">
                      ✓ You have signed approval for this request
                    </span>
                  )}

                  {isReviewable && isReviewer && !alreadyApproved && !isSelf && (
                    <div className="action-buttons-group">
                      <button
                        className="primary-button"
                        onClick={() => handleApprove(app.id)}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === `approve-${app.id}` ? "Signing Approval..." : "✓ Approve Application"}
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => handleReject(app.id)}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === `reject-${app.id}` ? "Rejecting..." : "✕ Reject"}
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <span className="status-note">
                      Quorum reached (2/2 approvals)! Application is pending Admin disbursement.
                    </span>
                  )}

                  {isDisbursed && (
                    <span className="status-note disbursed">
                      ✓ Funds disbursed on-chain to applicant wallet.
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}