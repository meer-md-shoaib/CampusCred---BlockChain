import { useState } from "react";
import { connectWallet } from "./connectWallet";
import RegisterStudent from "./RegisterStudent";
import ApplyForFunding from "./ApplyForFunding";
import AdminPanel from "./AdminPanel";
import ReviewerPanel from "./ReviewerPanel";
import ApplicationTracker from "./ApplicationTracker";

const TABS = [
  { id: "student", label: "Student", icon: "🎓" },
  { id: "apply", label: "Apply", icon: "📝" },
  { id: "reviewer", label: "Reviewer", icon: "✅" },
  { id: "admin", label: "Admin", icon: "🛡️" },
  { id: "track", label: "Track", icon: "🔍" },
];

function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const [address, setAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("student");

  async function handleConnect() {
    setError("");
    setConnecting(true);

    try {
      const wallet = await connectWallet();
      setAddress(wallet.address);
    } catch (walletError) {
      setError(walletError.message || "Unable to connect MetaMask.");
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setAddress("");
    setActiveTab("student");
    setError("");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <div>
            <h1>CampusCred</h1>
            <p>Decentralized Student Funding Platform</p>
          </div>
        </div>

        <div className="wallet-area">
          {address ? (
            <>
              <div className="wallet-chip">
                <span className="wallet-dot" />
                {shortenAddress(address)}
              </div>
              <button className="ghost-button" onClick={handleDisconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button
              className="primary-button"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="alert alert-error">
          <strong>Connection error:</strong> {error}
        </div>
      )}

      {!address ? (
        <main className="welcome-card">
          <h2>Welcome to CampusCred</h2>
          <p>
            Connect your MetaMask wallet to register as a student, request
            financial support, review applications, approve funding, and track
            CRED disbursements.
          </p>

          <div className="feature-grid">
            <div className="feature">
              <span>🎓</span>
              <h3>Register</h3>
              <p>Create a verified student profile on-chain.</p>
            </div>

            <div className="feature">
              <span>📝</span>
              <h3>Apply</h3>
              <p>Submit a funding request with supporting documents.</p>
            </div>

            <div className="feature">
              <span>✅</span>
              <h3>Approve</h3>
              <p>Authorized reviewers evaluate and approve applications.</p>
            </div>

            <div className="feature">
              <span>💰</span>
              <h3>Receive CRED</h3>
              <p>Approved students receive CRED tokens directly.</p>
            </div>
          </div>

          <button
            className="primary-button large"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect MetaMask"}
          </button>
        </main>
      ) : (
        <>
          <nav className="tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <main className="content">
            {activeTab === "student" && <RegisterStudent />}

            {activeTab === "apply" && <ApplyForFunding />}

            {activeTab === "reviewer" && <ReviewerPanel />}

            {activeTab === "admin" && <AdminPanel />}

            {activeTab === "track" && <ApplicationTracker />}
          </main>
        </>
      )}

      <footer className="app-footer">
        <p>CampusCred • Blockchain-Based Student Funding System</p>
      </footer>
    </div>
  );
}

export default App;