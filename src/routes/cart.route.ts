import { Router } from "express"
import { body } from "express-validator"
import { CartController } from "../controllers/Cart.Controller"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validation"

const router = Router()
const cartController = new CartController()

// All cart routes require authentication
router.use(authenticate)

router.post(
  "/",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    validate,
  ],
  cartController.addItem.bind(cartController),
)

router.get("/", cartController.getCart.bind(cartController))

router.put(
  "/:itemId",
  [body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"), validate],
  cartController.updateItem.bind(cartController),
)

router.delete("/:itemId", cartController.removeItem.bind(cartController))

export default router
