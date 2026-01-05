import { Router, type Router as ExpressRouter } from "express";
import { authenticate, requireAdmin } from "../middleware/auth"
import { upload } from "../config/multer"
import { InsuranceLogoController } from "../controllers/insurance-logo.controller";

const router:ExpressRouter = Router()
const insuranceLogoController = new InsuranceLogoController()

// Public routes
router.get("/", insuranceLogoController.getAll.bind(insuranceLogoController))

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("logo"),
  insuranceLogoController.create.bind(insuranceLogoController),
)

router.get("/:id", authenticate, requireAdmin, insuranceLogoController.getById.bind(insuranceLogoController))


router.put(
  "/:id",
  authenticate,
  requireAdmin,
  upload.single("logo"),
  insuranceLogoController.update.bind(insuranceLogoController),
)

router.delete("/:id", authenticate, requireAdmin, insuranceLogoController.delete.bind(insuranceLogoController))

export default router
