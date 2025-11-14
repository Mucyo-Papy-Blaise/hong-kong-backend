import { Router } from "express"
import { BrandController } from "../controllers/Brand.Controller"
import { authenticate, requireAdmin } from "../middleware/auth"
import { upload } from "../config/multer"

const router = Router()
const brandController = new BrandController()

// Public routes
router.get("/", brandController.getAll.bind(brandController))
router.get("/:id", brandController.getById.bind(brandController))
router.get("/:brandSlug/products", brandController.getProductsByBrand.bind(brandController))

// Admin routes
router.post("/", authenticate, requireAdmin, upload.single("logo"), brandController.create.bind(brandController))

router.put("/:id", authenticate, requireAdmin, upload.single("logo"), brandController.update.bind(brandController))

router.delete("/:id", authenticate, requireAdmin, brandController.delete.bind(brandController))

export default router
