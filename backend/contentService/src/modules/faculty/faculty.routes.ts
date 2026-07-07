import { Router } from "express";
import { FacultyController } from "./faculty.controller";

const router = Router();

router.post("/", FacultyController.create);
router.get("/", FacultyController.getAll);
router.get("/:id", FacultyController.getById);
router.put("/:id", FacultyController.update);
router.delete("/:id", FacultyController.delete);

export default router;
