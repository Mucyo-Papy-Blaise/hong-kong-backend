import { Router, type Router as ExpressRouter } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { upload } from "../config/multer";
import { AuthController } from "../controllers/auth.controller";

const router:ExpressRouter = Router();
const authController = new AuthController();

// Register (with image upload)
router.post(
  "/register",
  upload.single("image"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validate,
  ],
  authController.register.bind(authController)
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authController.login.bind(authController)
);

// Get Logged in User
router.get('/me', authenticate, authController.getLoggedInUser.bind(authController))

// Logout
router.post("/logout", authenticate, authController.logout.bind(authController));

export default router;
