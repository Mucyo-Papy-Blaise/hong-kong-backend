import { Router } from "express"
import { ProductController } from "../controllers/Product.Controller"
import { authenticate, requireAdmin } from "../middleware/auth"
import { upload } from "../config/multer"

const router = Router()
const productController = new ProductController()

// Public routes
router.get("/", productController.getAll.bind(productController))
router.get("/:id", productController.getById.bind(productController))

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.array("images", 10),
  productController.create.bind(productController),
)

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  upload.array("images", 10),
  productController.update.bind(productController),
)

router.delete("/:id", authenticate, requireAdmin, productController.delete.bind(productController))

// Related products
router.get("/related/:productId", productController.getRelatedProducts.bind(productController))

export default router
