import { Request, Response, NextFunction } from "express";
// ...existing code...
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Placeholder for auth middleware
  next();
}
