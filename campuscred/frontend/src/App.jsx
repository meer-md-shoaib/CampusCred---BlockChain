import { useState, useEffect } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { connectWallet, connectDemoProfile } from "./connectWallet";
import {
  DEMO_PROFILES,
  CONTRACT_ADDRESSES,
  fundingApplicationAbi,
  studentRegistryAbi,
  campusTokenAbi,
} from "./contracts";
import RegisterStudent from "./RegisterStudent";
import ApplyForFunding from "./ApplyForFunding";
import AdminPanel from "./AdminPanel";
import ReviewerPanel from "./ReviewerPanel";
import ApplicationTracker from "./ApplicationTracker";

const TABS = [
  { id: "student", label: "Student Profile", icon: "🎓" },
  { id: "apply", label: "Apply for Grant", icon: "📝" },
  { id: "reviewer", label: "Reviewer Portal", icon: "✅" },
  { id: "admin", label: "Admin & Treasury", icon: "🛡️" },
  { id: "track", label: "Application Tracker", icon: "🔍" },
  { id: "profiles", label: "Profiles & Keys", icon: "🔑" },
];

function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const [walletInfo, setWalletInfo] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("student");
  const [activeRoleBadge, setActiveRoleBadge] = useState("Connected");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [copiedKey, setCopiedKey] = useState("");

  // Connect on load to default profile (Admin) for instant experience if no metamask
  useEffect(() => {
    handleSelectProfile(DEMO_PROFILES[0]);
  }, []);

  useEffect(() => {
    if (walletInfo?.address) {
      detectRolesAndBalance();
    }
  }, [walletInfo?.address]);

  async function detectRolesAndBalance() {
    if (!walletInfo?.provider || !walletInfo?.address) return;

    try {
      const { provider, address } = walletInfo;
      const funding = new Contract(
        CONTRACT_ADDRESSES.fundingApplication,
        fundingApplicationAbi,
        provider
      );
      const registry = new Contract(
        CONTRACT_ADDRESSES.studentRegistry,
        studentRegistryAbi,
        provider
      );
      const token = new Contract(
        CONTRACT_ADDRESSES.campusToken,
        campusTokenAbi,
        provider
      );

      const [adminAddr, isRev, isStudent, bal] = await Promise.all([
        funding.admin().catch(() => ""),
        funding.isReviewer(address).catch(() => false),
        registry.isStudentRegistered(address).catch(() => false),
        token.balanceOf(address).catch(() => 0n),
      ]);

      const isAdmin = adminAddr.toLowerCase() === address.toLowerCase();

      if (isAdmin && isRev) {
        setActiveRoleBadge("🛡️ Admin & Reviewer 1");
      } else if (isAdmin) {
        setActiveRoleBadge("🛡️ Admin");
      } else if (isRev) {
        setActiveRoleBadge("✅ Faculty Reviewer 2");
      } else if (isStudent) {
        setActiveRoleBadge("🎓 Verified Student");
      } else {
        setActiveRoleBadge("👤 Unregistered User");
      }

      setTokenBalance(formatUnits(bal, 18));
    } catch (err) {
      console.error("Role detection error:", err);
    }
  }

  async function handleConnectMetaMask() {
    setError("");
    setConnecting(true);
    try {
      const res = await connectWallet();
      setWalletInfo(res);
      setActiveRoleBadge("Detecting...");
    } catch (walletError) {
      setError(walletError.message || "Unable to connect MetaMask.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleSelectProfile(profile) {
    setError("");
    setConnecting(true);
    try {
      const res = await connectDemoProfile(profile);
      setWalletInfo(res);
      setActiveRoleBadge(profile.badge);
    } catch (profileError) {
      setError(profileError.message || "Failed to switch profile.");
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setWalletInfo(null);
    setActiveRoleBadge("");
    setActiveTab("student");
    setError("");
  }

  function copyToClipboard(text, id) {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(""), 2000);
  }

  const currentAddress = walletInfo?.address || "";

  return (
    <div className="app">
      {/* Global Application Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <div>
            <h1>CampusCred</h1>
            <p>Decentralized Student Micro-Funding System</p>
          </div>
        </div>

        {/* Profile Switcher & Wallet Bar */}
        <div className="wallet-area">
          {/* Quick Profile Selector Dropdown */}
          <div className="profile-selector-wrap">
            <span className="profile-select-label">Active Persona:</span>
            <select
              className="cyber-select"
              value={
                DEMO_PROFILES.find(
                  (p) => p.address.toLowerCase() === currentAddress.toLowerCase()
                )?.id || "custom"
              }
              onChange={(e) => {
                const selected = DEMO_PROFILES.find((p) => p.id === e.target.value);
                if (selected) handleSelectProfile(selected);
              }}
            >
              {DEMO_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.badge} — {p.name}
                </option>
              ))}
              {walletInfo?.isMetaMask && <option value="custom">🦊 MetaMask Wallet</option>}
            </select>
          </div>

          {currentAddress ? (
            <>
              <div className="role-chip">
                {activeRoleBadge}
              </div>

              <div className="balance-chip" title="CRED Token Balance">
                💰 {Number(tokenBalance).toLocaleString()} CRED
              </div>

              <div className="wallet-chip">
                <span className="wallet-dot" />
                {shortenAddress(currentAddress)}
              </div>

              <button className="ghost-button" onClick={handleDisconnect}>
                Reset
              </button>
            </>
          ) : (
            <button
              className="primary-button"
              onClick={handleConnectMetaMask}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="alert alert-error" style={{ margin: "16px 32px 0" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Viewports */}
      <main className="content">
        {activeTab === "student" && (
          <RegisterStudent
            signer={walletInfo?.signer}
            provider={walletInfo?.provider}
            address={currentAddress}
            onProfileUpdate={detectRolesAndBalance}
          />
        )}

        {activeTab === "apply" && (
          <ApplyForFunding
            signer={walletInfo?.signer}
            provider={walletInfo?.provider}
            address={currentAddress}
            onApplicationSubmitted={() => setActiveTab("track")}
          />
        )}

        {activeTab === "reviewer" && (
          <ReviewerPanel
            signer={walletInfo?.signer}
            provider={walletInfo?.provider}
            address={currentAddress}
            onReviewAction={detectRolesAndBalance}
          />
        )}

        {activeTab === "admin" && (
          <AdminPanel
            signer={walletInfo?.signer}
            provider={walletInfo?.provider}
            address={currentAddress}
            onAdminAction={detectRolesAndBalance}
          />
        )}

        {activeTab === "track" && (
          <ApplicationTracker
            provider={walletInfo?.provider}
            address={currentAddress}
          />
        )}

        {/* Dedicated Persona & Private Keys Tab */}
        {activeTab === "profiles" && (
          <div className="card-panel">
            <div className="panel-header">
              <div>
                <h2>Demo Profiles & Assigned Private Keys</h2>
                <p className="subtitle">
                  Use these pre-funded test accounts to verify role-based permissions and multi-party approvals.
                </p>
              </div>
              <span className="panel-badge">Security & Access</span>
            </div>

            <div className="alert alert-info" style={{ marginBottom: "24px" }}>
              💡 <strong>Instant Testing:</strong> Click <strong>"Switch to This Profile"</strong> to instantly authenticate as that persona without any extension, or copy the <strong>Private Key</strong> into MetaMask (import account) for live extension testing!
            </div>

            <div className="profiles-table-container">
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Role & Persona</th>
                    <th>Permissions & Purpose</th>
                    <th>Wallet Address</th>
                    <th>Assigned Private Key</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_PROFILES.map((p) => {
                    const isCurrent =
                      currentAddress.toLowerCase() === p.address.toLowerCase();

                    return (
                      <tr key={p.id} className={isCurrent ? "active-row" : ""}>
                        <td>
                          <div className="persona-cell">
                            <span className="persona-badge">{p.badge}</span>
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="desc-text">{p.description}</span>
                        </td>
                        <td>
                          <div className="key-copy-group">
                            <span className="mono-font">{shortenAddress(p.address)}</span>
                            <button
                              className="ghost-button mini"
                              onClick={() => copyToClipboard(p.address, `addr-${p.id}`)}
                            >
                              {copiedKey === `addr-${p.id}` ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="key-copy-group">
                            <span className="mono-font private-key-blur">
                              {p.privateKey.slice(0, 10)}...{p.privateKey.slice(-6)}
                            </span>
                            <button
                              className="ghost-button mini"
                              onClick={() => copyToClipboard(p.privateKey, `pk-${p.id}`)}
                            >
                              {copiedKey === `pk-${p.id}` ? "Copied Key!" : "Copy Key"}
                            </button>
                          </div>
                        </td>
                        <td>
                          {isCurrent ? (
                            <span className="status-pill status-approved">Active Now</span>
                          ) : (
                            <button
                              className="primary-button mini"
                              onClick={() => handleSelectProfile(p)}
                            >
                              Switch ➔
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>CampusCred • Multi-Party Student Funding Protocol on Ethereum</p>
      </footer>
    </div>
  );
}

export default App;