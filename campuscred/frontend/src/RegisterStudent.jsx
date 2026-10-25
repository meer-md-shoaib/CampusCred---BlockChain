import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import {
  CONTRACT_ADDRESSES,
  studentRegistryAbi,
} from "./contracts";

export default function RegisterStudent({ signer, provider, address, onProfileUpdate }) {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    if (address && provider) {
      checkStudentStatus();
    }
  }, [address, provider]);

  async function checkStudentStatus() {
    try {
      const activeProvider = provider || new BrowserProvider(window.ethereum);
      const registry = new Contract(
        CONTRACT_ADDRESSES.studentRegistry,
        studentRegistryAbi,
        activeProvider
      );

      const isRegistered = await registry.isStudentRegistered(address);
      if (isRegistered) {
        const data = await registry.getStudent(address);
        setStudentProfile({
          studentId: data.studentId,
          name: data.name,
          department: data.department,
          isVerified: data.isVerified,
        });
      } else {
        setStudentProfile(null);
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
    }
  }

  async function register() {
    if (!studentId.trim() || !name.trim() || !department.trim()) {
      setMessage("Please fill in Student ID, Name, and Department.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("Submitting student registration to blockchain...");
      setMessageType("info");

      let activeSigner = signer;
      if (!activeSigner && window.ethereum) {
        const prov = new BrowserProvider(window.ethereum);
        activeSigner = await prov.getSigner();
      }

      const registry = new Contract(
        CONTRACT_ADDRESSES.studentRegistry,
        studentRegistryAbi,
        activeSigner
      );

      const tx = await registry.registerStudent(
        studentId.trim(),
        name.trim(),
        department.trim()
      );

      setMessage("Transaction sent! Waiting for block confirmation...");
      await tx.wait();

      setMessage("Student registered successfully! On-chain identity active.");
      setMessageType("success");
      setStudentId("");
      setName("");
      setDepartment("");
      await checkStudentStatus();
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      setMessage(error.reason || error.shortMessage || error.message || "Registration failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <div>
          <h2>Student Registration & Identity</h2>
          <p className="subtitle">
            Create or inspect your decentralized academic credentials on-chain.
          </p>
        </div>
        <span className="panel-badge">Identity Registry</span>
      </div>

      {studentProfile ? (
        <div className="profile-verified-card">
          <div className="profile-badge-row">
            <span className="status-pill status-approved">
              {studentProfile.isVerified ? "✓ Verified Student" : "⏳ Pending Verification"}
            </span>
            <span className="mono-subtext">Wallet: {address}</span>
          </div>

          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">Student ID</span>
              <span className="detail-value highlight">{studentProfile.studentId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{studentProfile.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-value">{studentProfile.department}</span>
            </div>
          </div>

          <div className="alert alert-success" style={{ marginTop: "20px" }}>
            ✓ This wallet is registered as a verified student and is eligible to apply for CRED funding grants!
          </div>
        </div>
      ) : (
        <div className="form-container">
          <div className="form-group">
            <label>Student ID</label>
            <input
              className="cyber-input"
              placeholder="e.g. CS-2024-001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              className="cyber-input"
              placeholder="e.g. Alice Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              className="cyber-input"
              placeholder="e.g. Computer Science & AI"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className="primary-button large"
            onClick={register}
            disabled={loading}
          >
            {loading ? "Registering on Blockchain..." : "Register Student Identity"}
          </button>
        </div>
      )}

      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginTop: "20px" }}>
          {message}
        </div>
      )}
    </div>
  );
}