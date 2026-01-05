import express from "express";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import { errorHandler } from "./shared/middlewares/errorHandler";
import router from "./modules/registerRoutes";
import guestRoutes from "./routes/guest.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Phục vụ thư mục ảnh tĩnh để Frontend có thể hiển thị ảnh
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1", router);
app.use("/api/guest", guestRoutes); // Đưa về chung một mối
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export { app, server, io };
