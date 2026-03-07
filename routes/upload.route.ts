import { Router, Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import logger from "@/utils/logger";

const router = Router();

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + random + ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // 1. Prevent double extensions (e.g., image.jpg.php)
  const parts = file.originalname.split(".");
  if (parts.length > 2) {
    cb(null, false);
    return;
  }

  // 2. Accept only specific images and PDFs
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Middleware to catch Multer-specific errors cleanly
const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  const uploader = upload.single("file");
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({
            success: false,
            message: "File exceeds the 5MB size limit.",
          });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// POST /api/upload
router.post("/", uploadSingle, (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Return the accessible URL
    // Return the accessible URL
    // Should point to the SERVER URL where static files are served
    const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";
    const fileUrl = `${SERVER_URL}/uploads/${req.file.filename}`;

    // Cleanup Old File if exists
    const oldUrl = req.body.oldUrl;
    if (oldUrl) {
      try {
        // Extract filename from URL (e.g. http://localhost:5000/uploads/file-123.jpg -> file-123.jpg)
        const oldFilename = oldUrl.split("/").pop();
        if (oldFilename) {
          const oldPath = path.join(process.cwd(), "uploads", oldFilename);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } catch (err) {
        logger.warn("Failed to delete old file", { error: (err as Error).message });
        // Don't fail the request, just log it
      }
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// GET /api/upload - List all files
router.get("/", (req, res) => {
  try {
    const uploadPath = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadPath)) {
      return res.json({ success: true, files: [] });
    }

    const files = fs
      .readdirSync(uploadPath)
      .filter((file) => {
        // Filter for images and PDFs only, ignore hidden files
        const ext = path.extname(file).toLowerCase();
        return (
          !file.startsWith(".") &&
          [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"].includes(
            ext,
          )
        );
      })
      .map((file) => {
        const filePath = path.join(uploadPath, file);
        const stats = fs.statSync(filePath);
        const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

        return {
          filename: file,
          url: `${SERVER_URL}/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          mimetype: path.extname(file).replace(".", ""),
        };
      })
      // Sort by newest first
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// DELETE /api/upload/:filename - Delete a file
router.delete("/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), "uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "File deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
