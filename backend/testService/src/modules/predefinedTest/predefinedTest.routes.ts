import { Router } from "express";
import { PredefinedTestController } from "./predefinedTest.controller";

const router = Router();

// Admin/Teacher endpoints
router.post("/", PredefinedTestController.create);
router.get("/", PredefinedTestController.getAll);
router.get("/pending", PredefinedTestController.getPending);
router.get("/join/:token", PredefinedTestController.getByToken);
router.get("/:id", PredefinedTestController.getById);
router.put("/:id", PredefinedTestController.update);
router.delete("/:id", PredefinedTestController.delete);
router.post("/:id/activate", PredefinedTestController.activate);
router.post("/:id/deactivate", PredefinedTestController.deactivate);
router.post("/:id/start", PredefinedTestController.startTest);

export default router;
