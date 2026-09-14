import { Router } from "express";
import { QuestionImportController } from "./questionImport.controller";

const router = Router();

router.get("/import-template", QuestionImportController.downloadTemplate);
router.post("/bulk", QuestionImportController.bulkCreate);

export default router;
