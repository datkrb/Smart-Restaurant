import { Router } from "express";
import * as tableController from "./table.controller";

const router = Router();

// --- TABLE ROUTES ---
router.get("/", tableController.getTables);
router.post("/", tableController.createTable);
router.put("/:id", tableController.updateTable);

export default router;

