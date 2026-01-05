import { Router, type Router as ExpressRouter } from "express";
import { body } from "express-validator"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validation"
import { WishlistController } from "../controllers/wishlist.controller";

const router:ExpressRouter = Router()
const wishlistController = new WishlistController()

// All wishlist routes require authentication
router.use(authenticate)

router.post(
  "/",
  [body("productId").notEmpty().withMessage("Product ID is required"), validate],
  wishlistController.addItem.bind(wishlistController),
)

router.get("/", wishlistController.getWishlist.bind(wishlistController))

router.delete("/:productId", wishlistController.removeItem.bind(wishlistController))

export default router
