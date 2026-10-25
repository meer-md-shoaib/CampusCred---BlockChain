import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import {
  CONTRACT_ADDRESSES,
  studentRegistryAbi,
} from "./contracts";

export default function RegisterStudent() {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");

  async function register() {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const registry = new Contract(
        CONTRACT_ADDRESSES.studentRegistry,
        studentRegistryAbi,
        signer
      );

      setMessage("Please confirm the transaction in MetaMask...");

      const tx = await registry.registerStudent(
        studentId,
        name,
        department
      );

      await tx.wait();

      setMessage("Student registered successfully.");
    } catch (error) {
      setMessage(error.reason || error.message);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Student Registration</h2>

      <input
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      />
      <br /><br />

        <button onClick={register}>Register Student</button>

      <p>{message}</p>
    </div>
  );
}