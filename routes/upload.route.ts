import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

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
const fileFilter = (req: any, file: any, cb: any) => {
  // Accept images and PDFs
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
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
        console.error("Failed to delete old file:", err);
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
