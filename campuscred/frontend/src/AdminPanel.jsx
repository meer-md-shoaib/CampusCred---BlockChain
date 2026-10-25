import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import {
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
  campusTokenAbi,
  STATUS_NAMES,
} from "./contracts";

export default function AdminPanel({ signer, provider, address, onAdminAction }) {
  const [reviewerAddress, setReviewerAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    if (address && provider) {
      loadAdminData();
    }
  }, [address, provider]);

  async function loadAdminData() {
    try {
      setLoading(true);
      const activeProvider = provider || new BrowserProvider(window.ethereum);
      
      const fundingContract = new Contract(
        CONTRACT_ADDRESSES.fundingApplication,
        fundingApplicationAbi,
        activeProvider
      );

      const tokenContract = new Contract(
        CONTRACT_ADDRESSES.campusToken,
        campusTokenAbi,
        activeProvider
      );

      const adminAddress = await fundingContract.admin();
      const userIsAdmin = adminAddress.toLowerCase() === address.toLowerCase();
      setIsAdmin(userIsAdmin);

      // Fetch Treasury balance
      const bal = await tokenContract.balanceOf(CONTRACT_ADDRESSES.fundingApplication);
      setTreasuryBalance(formatUnits(bal, 18));

      // Fetch applications needing disbursement
      const allApps = await fundingContract.getAllApplications();
      const pendingDisbursement = [];

      for (const app of allApps) {
        if (!app.exists) continue;
        // status == 2 is Approved, status == 4 is Disbursed
        if (Number(app.status) === 2 || Number(app.status) === 4) {
          pendingDisbursement.push({
            id: Number(app.id),
            student: app.student,
            title: app.title,
            amount: formatUnits(app.amount, 18),
            status: Number(app.status),
            approvalCount: Number(app.approvalCount),
          });
        }
      }

      setApprovedApplications(pendingDisbursement);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addReviewer() {
    if (!reviewerAddress.trim()) {
      setMessage("Please enter a valid wallet address.");
      setMessageType("error");
      return;
    }

    try {
      setActionLoading("addReviewer");
      setMessage("Submitting reviewer addition transaction...");
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

      const tx = await fundingContract.addReviewer(reviewerAddress.trim());
      await tx.wait();

      setMessage(`Wallet ${reviewerAddress} successfully authorized as a Reviewer.`);
      setMessageType("success");
      setReviewerAddress("");
      await loadAdminData();
      if (onAdminAction) onAdminAction();
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message || "Failed to add reviewer");
      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  }

  async function disburseFunds(appId) {
    try {
      setActionLoading(`disburse-${appId}`);
      setMessage(`Executing on-chain CRED disbursement for Application #${appId}...`);
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

      const tx = await fundingContract.disburseFunds(appId);
      await tx.wait();

      setMessage(`CRED tokens successfully disbursed on-chain for Application #${appId}!`);
      setMessageType("success");
      await loadAdminData();
      if (onAdminAction) onAdminAction();
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message || "Disbursement failed");
      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <div>
          <h2>System Administration & Treasury</h2>
          <p className="subtitle">
            Manage reviewer authorizations and execute token disbursements for fully approved student grants.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`status-pill ${isAdmin ? "status-approved" : "status-rejected"}`}>
            {isAdmin ? "🛡️ System Administrator" : "✕ Not Admin"}
          </span>
          <button className="ghost-button" onClick={loadAdminData} disabled={loading}>
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="alert alert-warning" style={{ marginBottom: "24px" }}>
          ⚠️ Notice: Connected wallet ({address}) is not the contract administrator. To perform administrative actions, switch to the <strong>Admin Profile</strong> using the Profile Switcher.
        </div>
      )}

      {/* Treasury Metric Banner */}
      <div className="treasury-banner">
        <div className="treasury-card">
          <span className="treasury-label">Smart Contract Treasury Balance</span>
          <span className="treasury-value">{Number(treasuryBalance).toLocaleString()} CRED</span>
          <span className="treasury-sub">Campus CRED tokens available for disbursement</span>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: "24px" }}>
          {message}
        </div>
      )}

      {/* Approved Applications Disbursement Section */}
      <div className="admin-section">
        <h3>Grant Disbursements (Fully Approved Quorum)</h3>
        <p className="section-desc">
          Applications below have reached the mandatory 2/2 faculty approvals and are ready for CRED release.
        </p>

        <div className="applications-list">
          {approvedApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications currently awaiting disbursement.</p>
            </div>
          ) : (
            approvedApplications.map((app) => {
              const isDisbursed = app.status === 4;

              return (
                <div key={app.id} className="application-card mini">
                  <div className="app-card-top">
                    <div className="app-id-title">
                      <span className="app-id-tag">#{app.id}</span>
                      <h4 className="app-title">{app.title}</h4>
                    </div>

                    <span className={`status-pill status-${STATUS_NAMES[app.status]?.toLowerCase().replace(" ", "-")}`}>
                      {STATUS_NAMES[app.status]}
                    </span>
                  </div>

                  <div className="app-meta-grid mini">
                    <div>
                      <span className="meta-label">Recipient Wallet</span>
                      <span className="meta-value mono-font">{app.student}</span>
                    </div>
                    <div>
                      <span className="meta-label">Disbursement Amount</span>
                      <span className="meta-value highlight-cyan">{app.amount} CRED</span>
                    </div>
                  </div>

                  <div className="app-card-actions">
                    {isDisbursed ? (
                      <span className="status-note disbursed">
                        ✓ Disbursed on-chain
                      </span>
                    ) : (
                      <button
                        className="primary-button"
                        onClick={() => disburseFunds(app.id)}
                        disabled={actionLoading !== null || !isAdmin}
                      >
                        {actionLoading === `disburse-${app.id}`
                          ? "Disbursing Tokens..."
                          : `💰 Disburse ${app.amount} CRED to Student`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

          </div>
  );
}
