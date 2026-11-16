export async function calculateSHA256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hashHex}`;
}

export async function generateAESKey() {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptFile(file, aesKey) {
  const fileBuffer = await file.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    fileBuffer
  );

  return {
    encryptedBuffer,
    iv,
  };
}

export async function decryptFile(encryptedBuffer, aesKey, iv) {
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    encryptedBuffer
  );

  return decryptedBuffer;
}

export async function downloadDecryptedFile(
  decryptedBuffer,
  originalFileName
) {
  const blob = new Blob([decryptedBuffer]);
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `decrypted-${originalFileName}`;
  link.click();

  URL.revokeObjectURL(url);
}
