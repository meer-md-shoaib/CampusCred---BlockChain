const UPLOAD_SERVER_URL = "http://localhost:4000";

export async function uploadEncryptedFileToIPFS(encryptedFile) {
  const formData = new FormData();
  formData.append("file", encryptedFile);

  const response = await fetch(`${UPLOAD_SERVER_URL}/api/upload-document`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "IPFS upload failed.");
  }

  const cid = result.cid ?? result.IpfsHash;
  if (typeof cid !== "string" || !cid.trim()) {
    throw new Error("IPFS upload succeeded, but the server returned no CID.");
  }

  return {
    cid,
    ipfsUrl: result.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
}
