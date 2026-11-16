import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import { PinataSDK } from "pinata";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

app.get("/", (request, response) => {
  response.json({
    message: "CampusCred 2.0 secure IPFS upload server is running.",
  });
});

app.post(
  "/api/upload-document",
  upload.single("file"),
  async (request, response) => {
    try {
      const file = request.file;

      if (!file) {
        return response.status(400).json({
          success: false,
          message: "No encrypted document was uploaded.",
        });
      }

      const allowedTypes = [
        "application/octet-stream",
        "application/pdf",
        "image/png",
        "image/jpeg",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return response.status(400).json({
          success: false,
          message: "Unsupported file type.",
        });
      }

      const ipfsFile = new File([file.buffer], file.originalname, {
        type: file.mimetype,
      });

      const result = await pinata.upload.public.file(ipfsFile);
      const cid = result?.cid ?? result?.IpfsHash;

      if (typeof cid !== "string" || !cid.trim()) {
        throw new Error("Pinata upload response did not include a CID.");
      }

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

      return response.status(200).json({
        success: true,
        cid,
        ipfsUrl,
      });
    } catch (error) {
      console.error("IPFS upload error:", error);

      return response.status(500).json({
        success: false,
        message: "IPFS upload failed. Please try again.",
      });
    }
  }
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `CampusCred secure upload server running on http://localhost:${PORT}`
  );
});