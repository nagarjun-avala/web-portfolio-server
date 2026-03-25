/* eslint-disable no-console */
import { db, connectDB, disconnectDB } from "./lib/db";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  await connectDB();
  try {
    const portfolio = await db.profile.findFirst();
    if (
      !portfolio ||
      !portfolio.resume ||
      typeof portfolio.resume !== "string"
    ) {
      console.log("No profile resume found");
      return;
    }
    const resumeUrl = portfolio.resume;

    if (
      !resumeUrl ||
      typeof resumeUrl !== "string" ||
      !resumeUrl.includes("/image/upload/")
    ) {
      console.log("Resume URL is already fine or missing: ", resumeUrl);
      return;
    }

    const match = resumeUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    if (!match) {
      console.log("Could not extract public ID from ", resumeUrl);
      return;
    }

    const publicId = match[1];
    console.log("Found image resource public_id:", publicId);

    console.log("Uploading as raw from URL:", resumeUrl);

    const newUpload = await cloudinary.uploader.upload(resumeUrl, {
      resource_type: "raw",
      folder: "portfolio",
      public_id: `resume-${Date.now()}-migrated.pdf`,
    });

    console.log("New raw URL:", newUpload.secure_url);

    await db.profile.update({
      where: { id: portfolio.id },
      data: { resume: newUpload.secure_url },
    });

    console.log("Database updated! Deleting old image resource...");
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    console.log("Migration complete.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await disconnectDB();
  }
}

run();
