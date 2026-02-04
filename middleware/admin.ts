import { Request, Response, NextFunction } from 'express';


const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: "Forbidden: Invalid API Key" });
  }
};
export { requireAdmin };
