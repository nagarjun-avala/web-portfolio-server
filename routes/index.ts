import { Router } from "express";
import portfolioRoutes from "@/routes/portfolio.route";
import messageRoutes from "@/routes/message.route";
import contactRoutes from "@/routes/contact.route";
import seoRoutes from "@/routes/seo.route";
import ogRoutes from "@/routes/og.route";

const router = Router();

// Mount routes
router.use("/portfolio", portfolioRoutes);
router.use("/messages", messageRoutes);
router.use("/contact", contactRoutes);
router.use("/seo-settings", seoRoutes);
router.use("/og", ogRoutes);

export default router

