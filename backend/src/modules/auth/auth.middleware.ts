import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import passport from "passport";

export const authMiddleware = passport.authenticate("jwt", { session: false });

export const roleGuard =
  (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
