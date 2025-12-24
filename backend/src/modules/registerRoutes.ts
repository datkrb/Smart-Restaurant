import { Express } from "express";
import authRouter from "./auth/auth.routes";

export function registerRoutes(app: Express) {
  app.use("/api/auth", authRouter);
  // Add other module routers here
}
