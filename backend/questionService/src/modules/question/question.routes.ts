import { Router } from "express";
import { QuestionController } from "./question.controller";
import questionImportRoutes from "./questionImport.routes";

const router = Router();

// Import routes (must come before /:id)
router.use(questionImportRoutes);

router.post("/", QuestionController.create);
router.get("/", QuestionController.getAll);
router.get("/search", QuestionController.search);
router.get("/filter", QuestionController.filter);
router.get("/topic/:topicId", QuestionController.getByTopicId);
router.get("/:id", QuestionController.getById);
router.put("/:id", QuestionController.update);
router.delete("/:id", QuestionController.delete);

export default router;
