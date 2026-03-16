import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key_change_me",
    ) as { id: string; [key: string]: unknown };
    req.user = verified;
    next();
  } catch {
    res
      .status(403)
      .json({ success: false, message: "Forbidden: Invalid token" });
  }
};

export { requireAdmin };
