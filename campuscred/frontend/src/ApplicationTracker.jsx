import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import {
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
  campusTokenAbi,
  STATUS_NAMES,
} from "./contracts";

export default function ApplicationTracker({ provider, address }) {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("CRED");
  const [loading, setLoading] = useState(false);
  const [filterMine, setFilterMine] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAllData();
  }, [address, provider]);

  async function loadAllData() {
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

      // Load balance if address is provided
      if (address) {
        const bal = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        const sym = await tokenContract.symbol();
        setTokenBalance(formatUnits(bal, decimals));
        setTokenSymbol(sym);
      }

      // Load all applications
      const allApps = await fundingContract.getAllApplications();
      const formatted = [];

      for (const app of allApps) {
        if (!app.exists) continue;
        formatted.push({
          id: Number(app.id),
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
      if (formatted.length > 0 && !selectedApp) {
        setSelectedApp(formatted[0]);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error reading application data from blockchain.");
    } finally {
      setLoading(false);
    }
  }

  const displayedApps = filterMine && address
    ? applications.filter((a) => a.student.toLowerCase() === address.toLowerCase())
    : applications;

  return (
    <div className="card-panel">
      <div className="panel-header">
        <div>
          <h2>Application Tracker & CRED Ledger</h2>
          <p className="subtitle">
            Transparent on-chain records of all funding submissions, multi-party reviews, and disbursements.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="balance-badge">
            <span className="balance-label">Your Wallet Balance:</span>
            <span className="balance-value">{Number(tokenBalance).toLocaleString()} {tokenSymbol}</span>
          </div>
          <button className="ghost-button" onClick={loadAllData} disabled={loading}>
            {loading ? "..." : "↻ Refresh"}
          </button>
        </div>
      </div>



      {displayedApps.length === 0 ? (
        <div className="empty-state">
          <p>{filterMine ? "You have not submitted any applications with this wallet." : "No applications recorded on-chain yet."}</p>
        </div>
      ) : (
        <div className="tracker-grid">
          {/* Applications Table / Cards List */}
          <div className="tracker-list">
            {displayedApps.map((app) => (
              <div
                key={app.id}
                className={`tracker-row-card ${selectedApp?.id === app.id ? "selected" : ""}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="row-card-header">
                  <span className="app-id-tag">#{app.id}</span>
                  <span className="row-card-title">{app.title}</span>
                  <span className={`status-pill status-${STATUS_NAMES[app.status]?.toLowerCase().replace(" ", "-")}`}>
                    {STATUS_NAMES[app.status]}
                  </span>
                </div>

                <div className="row-card-footer">
                  <span className="row-amount">{app.amount} CRED</span>
                  <span className="row-approvals">Approvals: {app.approvalCount}/2</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Inspector Panel */}
          {selectedApp && (
            <div className="tracker-detail-panel">
              <div className="detail-panel-top">
                <h3>Application #{selectedApp.id} Details</h3>
                <span className={`status-pill status-${STATUS_NAMES[selectedApp.status]?.toLowerCase().replace(" ", "-")}`}>
                  {STATUS_NAMES[selectedApp.status]}
                </span>
              </div>

              <div className="detail-data-block">
                <span className="detail-label">Title</span>
                <span className="detail-main-text">{selectedApp.title}</span>
              </div>

              <div className="detail-data-block">
                <span className="detail-label">Grant Justification</span>
                <p className="detail-p-text">{selectedApp.reason}</p>
              </div>

              <div className="detail-metrics-row">
                <div className="metric-box">
                  <span className="metric-lbl">Requested Amount</span>
                  <span className="metric-val cyan">{selectedApp.amount} CRED</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Quorum Approvals</span>
                  <span className="metric-val">{selectedApp.approvalCount} of 2 Required</span>
                </div>
              </div>

              <div className="detail-data-block">
                <span className="detail-label">Applicant Wallet</span>
                <span className="detail-code-text mono-font">{selectedApp.student}</span>
              </div>

              <div className="detail-data-block">
                <span className="detail-label">Verification Document (IPFS CID)</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                  <span className="detail-code-text mono-font">{selectedApp.documentCid}</span>
                  <a
                    href={`https://ipfs.io/ipfs/${selectedApp.documentCid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ghost-button mini"
                  >
                    View on IPFS ↗
                  </a>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div className="workflow-stepper">
                <span className="detail-label" style={{ marginBottom: "12px", display: "block" }}>
                  Lifecycle Status
                </span>
                <div className="stepper-track">
                  <div className={`step ${selectedApp.status >= 0 ? "active" : ""}`}>
                    <span className="step-circle">1</span>
                    <span className="step-name">Submitted</span>
                  </div>
                  <div className={`step-line ${selectedApp.status >= 1 ? "active" : ""}`} />
                  <div className={`step ${selectedApp.status >= 1 ? "active" : ""}`}>
                    <span className="step-circle">2</span>
                    <span className="step-name">Reviewing</span>
                  </div>
                  <div className={`step-line ${selectedApp.status >= 2 ? "active" : ""}`} />
                  <div className={`step ${selectedApp.status >= 2 ? "active" : ""}`}>
                    <span className="step-circle">3</span>
                    <span className="step-name">Approved</span>
                  </div>
                  <div className={`step-line ${selectedApp.status >= 4 ? "active" : ""}`} />
                  <div className={`step ${selectedApp.status >= 4 ? "active" : ""}`}>
                    <span className="step-circle">4</span>
                    <span className="step-name">Disbursed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}