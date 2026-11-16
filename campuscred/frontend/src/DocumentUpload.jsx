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
import { CONTRACT_ADDRESSES, documentRegistryAbi } from "./contracts";

function DocumentUpload({ onDocumentReady, signer }) {
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

        setIsRegisteringOnChain(true);
        const activeSigner =
          signer ||
          (window.ethereum
            ? await new ethers.BrowserProvider(window.ethereum).getSigner()
            : null);

        if (!activeSigner) {
          throw new Error("Connect a wallet to register the document on-chain.");
        }

        const documentRegistry = new ethers.Contract(
          CONTRACT_ADDRESSES.documentRegistry,
          documentRegistryAbi,
          activeSigner
        );
        const hashBytes = ethers.getBytes(hash);
        const hashBytes32 = ethers.toBeHex(ethers.hexlify(hashBytes), 32);
        const signerAddress = await activeSigner.getAddress();
        const alreadyRegistered =
          await documentRegistry.isDocumentRegistered(hashBytes32);

        if (alreadyRegistered) {
          const [registeredCid, documentOwner] =
            await documentRegistry.getDocument(hashBytes32);

          if (
            registeredCid !== ipfsResult.cid ||
            documentOwner.toLowerCase() !== signerAddress.toLowerCase()
          ) {
            throw new Error(
              "This document hash is already registered to a different CID or owner."
            );
          }
        } else {
          const tx = await documentRegistry.registerDocument(
            hashBytes32,
            ipfsResult.cid
          );
          await tx.wait();
        }

        setIsRegisteredOnChain(true);
        onDocumentReady?.({
          documentHash: hashBytes32,
          cid: ipfsResult.cid,
          ipfsUrl: ipfsResult.ipfsUrl,
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

      {isRegisteringOnChain && (
        <div className="status-message processing">
          Registering document hash and IPFS CID on blockchain...
        </div>
      )}

      {isRegisteredOnChain && (
        <div className="blockchain-result">
          <p className="blockchain-label">BLOCKCHAIN DOCUMENT PROOF</p>

          <div className="blockchain-details">
            <p>
              <strong>Storage Status:</strong> Document Registered On-Chain
            </p>
            <p>
              <strong>Document Hash:</strong>
            </p>
            <p className="blockchain-hash">{documentHash}</p>
            <p>
              <strong>IPFS CID:</strong>
            </p>
            <p className="blockchain-cid">{ipfsCid}</p>
            <p>
              <strong>Integrity Protection:</strong> SHA-256 hash stored on blockchain
            </p>
          </div>
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
