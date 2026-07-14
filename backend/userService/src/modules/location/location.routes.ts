import { Router } from "express";
import { LocationController } from "./location.controller";

const router = Router();

router.post("/", LocationController.create);
router.get("/", LocationController.getAll);
router.get("/:id", LocationController.getById);
router.put("/:id", LocationController.update);
router.delete("/:id", LocationController.delete);

export default router;
