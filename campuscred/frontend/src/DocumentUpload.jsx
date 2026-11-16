import { useState } from "react";
import { ethers } from "ethers";
import {
  calculateSHA256,
  generateAESKey,
  encryptFile,
  decryptFile,
  downloadDecryptedFile,
} from "./crypto";
import { uploadEncryptedFileToIPFS } from "./ipfs";

function DocumentUpload({
  onDocumentReady,
  documentRegistryContract,
  onConnectMetaMask,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentHash, setDocumentHash] = useState("");
  const [encryptedFile, setEncryptedFile] = useState(null);
  const [encryptionIv, setEncryptionIv] = useState(null);
  const [aesKey, setAesKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [error, setError] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [isUploadedToIPFS, setIsUploadedToIPFS] = useState(false);
  const [isRegisteringOnChain, setIsRegisteringOnChain] = useState(false);
  const [isRegisteredOnChain, setIsRegisteredOnChain] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files[0];

    setSelectedFile(null);
    setDocumentHash("");
    setEncryptedFile(null);
    setEncryptionIv(null);
    setAesKey(null);
    setIsEncrypted(false);
    setIsDecrypted(false);
    setError("");
    setIpfsCid("");
    setIpfsUrl("");
    setIsUploadingToIPFS(false);
    setIsUploadedToIPFS(false);
    setIsRegisteringOnChain(false);
    setIsRegisteredOnChain(false);
    setRegistrationMessage("");
    onDocumentReady?.(null);

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, PNG, JPG, or TXT file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      return;
    }

    try {
      setIsProcessing(true);

      const hash = await calculateSHA256(file);
      const key = await generateAESKey();
      const { encryptedBuffer, iv } = await encryptFile(file, key);

      const encryptedBlob = new Blob([encryptedBuffer]);
      const encryptedFileObject = new File(
        [encryptedBlob],
        `encrypted-${file.name}`,
        { type: "application/octet-stream" }
      );

      setSelectedFile(file);
      setDocumentHash(hash);
      setEncryptedFile(encryptedFileObject);
      setEncryptionIv(iv);
      setAesKey(key);
      setIsEncrypted(true);

      try {
        setIsUploadingToIPFS(true);

        const ipfsResult = await uploadEncryptedFileToIPFS(encryptedFileObject);

        setIpfsCid(ipfsResult.cid);
        setIpfsUrl(ipfsResult.ipfsUrl);
        setIsUploadedToIPFS(true);
        setIsUploadingToIPFS(false);
        onDocumentReady?.({
          documentHash: hash,
          cid: ipfsResult.cid,
          ipfsUrl: ipfsResult.ipfsUrl,
          registered: false,
        });
      } catch (ipfsError) {
        setError(ipfsError.message);
        onDocumentReady?.(null);
      } finally {
        setIsRegisteringOnChain(false);
        setIsUploadingToIPFS(false);
      }
    } catch {
      setError("Unable to process document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRegisterOnChain() {
    try {
      setError("");
      setIsRegisteringOnChain(true);

      if (!documentHash || !ipfsCid) {
        throw new Error("Document hash or IPFS CID is missing.");
      }

      if (!documentRegistryContract || !onConnectMetaMask) {
        throw new Error("Document Registry or MetaMask connection is unavailable.");
      }

      const walletInfo = await onConnectMetaMask();
      const signer = walletInfo?.signer;
      if (!signer || !walletInfo.isMetaMask) {
        throw new Error("Connect a MetaMask account to approve the transaction.");
      }

      const provider = walletInfo.provider;
      const signerAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n) {
        throw new Error(
          "Switch MetaMask to the local Hardhat network (chain ID 31337) to register this document."
        );
      }

      const documentRegistry = documentRegistryContract.connect(signer);

      const hashBytes = ethers.getBytes(documentHash);
      const alreadyExists = await documentRegistry.verifyDocument(hashBytes);

      if (alreadyExists) {
        const [, registeredCid, owner] =
          await documentRegistry.getDocument(hashBytes);
        if (
          registeredCid !== ipfsCid ||
          owner.toLowerCase() !== signerAddress.toLowerCase()
        ) {
          throw new Error(
            "This document hash is already registered to a different CID or owner."
          );
        }

        setRegistrationMessage("This document is already registered on-chain.");
        setIsRegisteredOnChain(true);
        onDocumentReady?.({
          documentHash,
          cid: ipfsCid,
          ipfsUrl,
          registered: true,
        });
        return;
      }

      setRegistrationMessage("Confirm the registration transaction in MetaMask.");
      const tx = await documentRegistry.registerDocument(hashBytes, ipfsCid);
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error("Document registration transaction was not confirmed.");
      }

      setRegistrationMessage(
        "Document hash and IPFS CID registered successfully on the blockchain."
      );
      setIsRegisteredOnChain(true);
      onDocumentReady?.({
        documentHash,
        cid: ipfsCid,
        ipfsUrl,
        registered: true,
      });
    } catch (err) {
      setError(
        err?.shortMessage ||
          err?.message ||
          "Document registration failed. Please try again."
      );
    } finally {
      setIsRegisteringOnChain(false);
    }
  }

  async function handleDecrypt() {
    try {
      setError("");
      setIsProcessing(true);

      const encryptedBuffer = await encryptedFile.arrayBuffer();
      const decryptedBuffer = await decryptFile(
        encryptedBuffer,
        aesKey,
        encryptionIv
      );

      await downloadDecryptedFile(decryptedBuffer, selectedFile.name);
      setIsDecrypted(true);
    } catch {
      setError("Decryption failed. The encryption key or file may be invalid.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="document-upload">
      <h2>Secure Document Upload</h2>
      <p>
        Upload an academic or supporting document. CampusCred generates a
        SHA-256 integrity hash and encrypts the document using AES-256-GCM.
      </p>

      <div className="upload-box">
        <label htmlFor="document-input" className="upload-label">
          <span className="upload-icon">📄</span>
          <span className="upload-text">
            {selectedFile ? selectedFile.name : "Choose Document"}
          </span>
        </label>

        <input
          id="document-input"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={handleFileChange}
        />
      </div>

      {isProcessing && (
        <div className="status-message processing">
          Processing document securely...
        </div>
      )}

      {error && <div className="status-message error">{error}</div>}

      {documentHash && (
        <div className="hash-result">
          <p className="hash-label">SHA-256 DOCUMENT HASH</p>
          <p className="hash-value">{documentHash}</p>

          <div className="hash-details">
            <p>
              <strong>File Name:</strong> {selectedFile.name}
            </p>
            <p>
              <strong>File Size:</strong>{" "}
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            <p>
              <strong>Integrity Status:</strong> Hash Generated Successfully
            </p>
          </div>
        </div>
      )}

      {isUploadingToIPFS && (
        <div className="status-message processing">
          Uploading encrypted document to IPFS...
        </div>
      )}

      {isUploadedToIPFS && (
        <div className="ipfs-result">
          <p className="ipfs-label">IPFS ENCRYPTED STORAGE</p>

          <div className="ipfs-details">
            <p>
              <strong>Storage Network:</strong> IPFS
            </p>
            <p>
              <strong>Storage Status:</strong> Encrypted Document Uploaded
            </p>
            <p>
              <strong>IPFS CID:</strong>
            </p>
            <p className="ipfs-cid">{ipfsCid}</p>
            <p>
              <strong>Access Link:</strong>{" "}
              <a href={ipfsUrl} target="_blank" rel="noreferrer">
                Open Encrypted Document
              </a>
            </p>
            <p>
              <strong>Confidentiality:</strong> Only encrypted content is stored on IPFS
            </p>
          </div>
        </div>
      )}

      {isUploadedToIPFS && !isRegisteredOnChain && (
        <div className="blockchain-registration">
          <p className="blockchain-label">BLOCKCHAIN DOCUMENT REGISTRATION</p>

          <p>
            Register the SHA-256 hash and IPFS CID on the blockchain to create a
            tamper-proof document record.
          </p>

          {isRegisteringOnChain && (
            <div className="status-message processing">
              Registering document hash and IPFS CID on blockchain...
            </div>
          )}

          <button
            type="button"
            className="register-button"
            onClick={handleRegisterOnChain}
            disabled={isRegisteringOnChain}
          >
            {isRegisteringOnChain
              ? "Registering On-Chain..."
              : "Register Secure Document"}
          </button>
        </div>
      )}

      {isRegisteredOnChain && (
        <div className="status-message success">
          {registrationMessage}
        </div>
      )}

      {isEncrypted && (
        <div className="encryption-result">
          <p className="encryption-label">AES-256-GCM ENCRYPTION</p>

          <div className="encryption-details">
            <p>
              <strong>Encryption Algorithm:</strong> AES-256-GCM
            </p>
            <p>
              <strong>Encryption Status:</strong> Document Encrypted
            </p>
            <p>
              <strong>Encrypted File:</strong> {encryptedFile.name}
            </p>
            <p>
              <strong>Encrypted File Size:</strong>{" "}
              {(encryptedFile.size / 1024).toFixed(2)} KB
            </p>
            <p>
              <strong>Confidentiality:</strong> Protected using AES-256-GCM
            </p>
          </div>

          <button
            type="button"
            className="decrypt-button"
            onClick={handleDecrypt}
            disabled={isProcessing}
          >
            {isProcessing ? "Decrypting..." : "Decrypt and Download"}
          </button>

          {isDecrypted && (
            <div className="status-message success">
              Document decrypted successfully and downloaded.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default DocumentUpload;
