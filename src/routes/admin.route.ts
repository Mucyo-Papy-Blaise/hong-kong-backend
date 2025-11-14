import { Router } from "express"
import { AdminController } from "../controllers/Admin.Controller"
import { authenticate, requireAdmin } from "../middleware/auth"

const router = Router()
const adminController = new AdminController()

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin)

router.get("/overview", adminController.getOverview.bind(adminController))

export default router
