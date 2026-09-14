import { Router } from "express";
import { UserController } from "./user.controller";
// import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.get("/", UserController.getAllUsers);
router.get("/role/:role", UserController.getUserByRole);
router.get("/me", UserController.getMe);
router.get("/:id", UserController.getUserById);
router.patch("/:id/location", UserController.assignLocation);

export default router;
