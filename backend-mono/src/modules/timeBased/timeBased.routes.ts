import { Router } from "express";
import { TimeBasedController } from "./timeBased.controller";

const router = Router();

router.post("/start", TimeBasedController.start);

export default router;
