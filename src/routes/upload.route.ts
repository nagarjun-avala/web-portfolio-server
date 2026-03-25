import { Router, Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { Readable } from "stream";
import logger from "@/utils/logger";
import { verifyToken } from "@/middleware/auth";

const router = Router();

// ─── Cloudinary config ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Storage: memory (we stream the buffer directly to Cloudinary) ───────────
// multer-storage-cloudinary only supports Cloudinary v1; we have v2, so we
// use multer's built-in memory storage and pipe the buffer ourselves.

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  // Reject double-extension filenames (e.g., image.jpg.php)
  const parts = file.originalname.split(".");
  if (parts.length > 2) {
    cb(null, false);
    return;
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    // video
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ];

  cb(null, allowedMimeTypes.includes(file.mimetype));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB (videos can be large)
  fileFilter,
});

// ─── Helper: upload buffer → Cloudinary ──────────────────────────────────────
function uploadToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions,
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err || !result) return reject(err ?? new Error("Upload failed"));
      resolve({ secure_url: result.secure_url, public_id: result.public_id });
    });
    Readable.from(buffer).pipe(stream);
  });
}

// ─── Helper: extract public_id from a Cloudinary URL ─────────────────────────
// e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/portfolio/abc.jpg
//   → "portfolio/abc"
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ─── Multer error wrapper ─────────────────────────────────────────────────────
const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  const uploader = upload.single("file");
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File exceeds the 100MB size limit.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ─── POST /api/upload  (auth required) ───────────────────────────────────────
router.post("/", verifyToken, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or file type not allowed.",
      });
    }

    const ext = req.file.originalname.split(".").pop()?.toLowerCase();
    const isPdf = ext === "pdf";
    const isVideo = req.file.mimetype.startsWith("video/");

    // Set up options depending on the file type
    const uploadOptions: import("cloudinary").UploadApiOptions = isPdf
      ? {
          folder: "portfolio",
          resource_type: "raw",
          public_id: `resume-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`,
        }
      : isVideo
        ? {
            folder: "portfolio",
            resource_type: "video",
            format: ext,
            allowed_formats: ["mp4", "webm", "ogg", "mov", "avi", "mkv"],
          }
        : {
            folder: "portfolio",
            resource_type: "auto",
            format: ext,
            allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
          };

    const { secure_url: fileUrl, public_id: publicId } =
      await uploadToCloudinary(req.file.buffer, uploadOptions);

    // ── Delete old Cloudinary file if provided ──
    const oldUrl = req.body.oldUrl as string | undefined;
    if (oldUrl) {
      const oldPublicId = extractPublicId(oldUrl);
      if (oldPublicId) {
        try {
          // Try image → video → raw in sequence
          let delResult = await cloudinary.uploader.destroy(oldPublicId);
          if (delResult.result === "not found") {
            delResult = await cloudinary.uploader.destroy(oldPublicId, {
              resource_type: "video",
            });
          }
          if (delResult.result === "not found") {
            await cloudinary.uploader.destroy(oldPublicId, {
              resource_type: "raw",
            });
          }
        } catch (err) {
          logger.warn("Failed to delete old Cloudinary file", {
            publicId: oldPublicId,
            error: (err as Error).message,
          });
        }
      }
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      url: fileUrl,
      publicId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── GET /api/upload - List files in the portfolio folder ────────────────────
router.get("/", async (_req, res) => {
  try {
    const [imageResult, videoResult, rawResult] = await Promise.all([
      cloudinary.api.resources({
        type: "upload",
        prefix: "portfolio/",
        resource_type: "image",
        max_results: 100,
      }),
      cloudinary.api.resources({
        type: "upload",
        prefix: "portfolio/",
        resource_type: "video",
        max_results: 100,
      }),
      cloudinary.api.resources({
        type: "upload",
        prefix: "portfolio/",
        resource_type: "raw",
        max_results: 100,
      }),
    ]);

    const toFile = (r: {
      public_id: string;
      secure_url: string;
      bytes: number;
      created_at: string;
      format: string;
    }) => ({
      publicId: r.public_id,
      url: r.secure_url,
      size: r.bytes,
      createdAt: r.created_at,
      format: r.format,
    });

    const files = [
      ...imageResult.resources.map(toFile),
      ...videoResult.resources.map(toFile),
      ...rawResult.resources.map(toFile),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// ─── DELETE /api/upload/:publicId - Delete by Cloudinary public_id ───────────
// public_id can contain slashes (e.g. "portfolio/abc"), so we use Express 5 wildcard syntax
router.delete("/{*publicId}", verifyToken, async (req, res) => {
  try {
    const publicId = req.params.publicId as string;
    if (!publicId) {
      return res
        .status(400)
        .json({ success: false, message: "publicId is required" });
    }

    // Try image → video → raw
    let result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "not found") {
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
    }
    if (result.result === "not found") {
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });
    }

    if (result.result === "ok" || result.result === "not found") {
      res.json({ success: true, message: "File deleted successfully" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "File could not be deleted" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
