import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError, ZodIssue } from "zod";

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: error.issues.map((e: ZodIssue) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
