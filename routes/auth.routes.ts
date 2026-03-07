import express from "express";
import { login, logout, getMe } from "../controllers/auth.ctrl";
import { verifyToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { strictLimiter } from "../middleware/rateLimiter";
import { loginSchema } from "../utils/schemas";

const router = express.Router();

router.post("/login", strictLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);

export default router;
