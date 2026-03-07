import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided!" });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key_change_me",
    ) as { id: string; [key: string]: unknown };
    req.user = verified;
    next();
  } catch (_err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};
