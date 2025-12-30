import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../shared/utils/token";
import { Role } from "@prisma/client";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = verifyAccessToken(token) as any;
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

export const roleGuard =
  (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
