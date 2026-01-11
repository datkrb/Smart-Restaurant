import { Router } from "express";
import * as MenuItemController from "./menu-item.controller";
import * as PhotoController from "./photo.controller";
import { upload } from "../../middleware/upload";

const router = Router();

// --- MENU ITEM ROUTES ---
router.get("/", MenuItemController.getMenuItems);
router.post("/", MenuItemController.createMenuItem);
router.put("/:id", MenuItemController.updateMenuItem);
router.delete("/:id", MenuItemController.deleteMenuItem);

// --- PHOTO ROUTES ---
router.post("/:itemId/photos", upload.array("photos", 5), PhotoController.uploadPhotos);
router.patch("/photos/set-primary", PhotoController.setPrimaryPhoto);
router.delete("/photos/:photoId", PhotoController.deletePhoto);

export default router;
