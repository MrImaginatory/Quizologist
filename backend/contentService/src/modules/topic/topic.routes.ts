import { Router } from "express";
import { TopicController } from "./topic.controller";

const router = Router();

router.post("/", TopicController.create);
router.get("/", TopicController.getAll);
router.get("/subject/:subjectId", TopicController.getBySubjectId);
router.get("/:id", TopicController.getById);
router.put("/:id", TopicController.update);
router.delete("/:id", TopicController.delete);

export default router;
