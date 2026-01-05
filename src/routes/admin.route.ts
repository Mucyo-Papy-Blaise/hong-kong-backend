import { Router, type Router as ExpressRouter } from "express";
import { authenticate, requireAdmin } from "../middleware/auth"
import { AdminController } from "../controllers/admin.controller";

const router: ExpressRouter = Router();
const adminController = new AdminController()

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin)

router.get("/overview", adminController.getOverview.bind(adminController))

export default router
