import cors from "cors";
import express, { type Request, type Response } from "express";
import multer from "multer";
import { scanPassportImage } from "./scanner";

const app = express();
const port = Number(process.env.PORT ?? 4005);
const serviceToken = process.env.PASSPORT_SCAN_SERVICE_TOKEN?.trim() || null;
const upload = multer({
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
});

app.use(cors());

app.get("/health", (_request: Request, response: Response) => {
  response.json({
    ok: true,
    service: "passport-scan-service",
  });
});

app.post("/api/passport-scan", upload.single("file"), async (request: Request, response: Response) => {
  try {
    if (serviceToken) {
      const headerToken = request.header("x-api-key")?.trim();

      if (!headerToken || headerToken !== serviceToken) {
        response.status(401).json({
          error: "Passport scan service token is invalid.",
        });
        return;
      }
    }

    if (!request.file) {
      response.status(400).json({
        error: "Passport image file is required.",
      });
      return;
    }

    if (!request.file.mimetype.startsWith("image/")) {
      response.status(400).json({
        error: "Only image uploads are supported.",
      });
      return;
    }

    const result = await scanPassportImage(request.file.buffer);

    response.setHeader("Cache-Control", "no-store");
    response.json(result);
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Passport scanning failed.",
    });
  }
});

app.listen(port, () => {
  console.log(`[passport-scan-service] listening on http://localhost:${port}`);
});
