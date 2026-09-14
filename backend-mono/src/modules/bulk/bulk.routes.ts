import { Router } from "express";
import { BulkController } from "./bulk.controller";

const router = Router();

// /api/content/bulk-hierarchy is mounted in index.ts
router.post("/", BulkController.createHierarchy);

export default router;
