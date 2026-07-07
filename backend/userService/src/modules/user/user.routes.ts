import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.get("/", UserController.getAllUsers);
router.get("/role/:role", UserController.getUserByRole);
router.get("/:id", UserController.getUserById);

export default router;
