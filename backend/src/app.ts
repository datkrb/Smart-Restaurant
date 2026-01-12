import express from "express";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import session from "express-session";
import passport from "./shared/config/passport";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import { errorHandler } from "./shared/middlewares/errorHandler";
import router from "./modules/registerRoutes";
import guestRoutes from "./modules/guest/guest.routes";
import adminRoutes from "./modules/admin/admin.routes";
import waiterRoutes from "./modules/waiter/waiter.routes";

const app = express();
const server = http.createServer(app);
// Socket.IO được gắn vào HTTP server để hỗ trợ realtime (websockets).
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware 
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

// Routes
app.use("/api/v1", router);
app.use("/api/guest", guestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/waiter", waiterRoutes);

app.use(errorHandler);

export { app, server, io };
