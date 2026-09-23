import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { UserController } from "./user.controller";
import { ApiResponse } from "../../utils/ApiResponse";
// import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// HIGH-04: rate limit auth endpoints to slow down credential stuffing
// and brute-force attacks. Window: 60 seconds per client IP.
const authRateLimit = (limit: number) =>
  rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: true, // Draft-6 `RateLimit` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (_req, res) => {
      ApiResponse.error(
        res,
        "Too many attempts. Please wait a minute and try again.",
        429
      );
    },
  });

const loginLimiter = authRateLimit(5); // 5 login attempts / minute / IP
const signupLimiter = authRateLimit(3); // 3 signup attempts / minute / IP

router.post("/signup", signupLimiter, UserController.signup);
router.post("/login", loginLimiter, UserController.login);
router.get("/", UserController.getAllUsers);
router.get("/role/:role", UserController.getUserByRole);
router.get("/me", UserController.getMe);
router.get("/:id", UserController.getUserById);
router.patch("/:id/location", UserController.assignLocation);

export default router;
