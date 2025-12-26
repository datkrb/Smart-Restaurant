import express from "express";
import cors from "cors";
import guestRoutes from "./routes/guest.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); 

app.use("/api/guest", guestRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});