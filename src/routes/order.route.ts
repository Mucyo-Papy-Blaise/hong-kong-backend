import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// User routes
router.post("/", authenticate, OrderController.createOrder);
router.get("/my-orders", authenticate, OrderController.getUserOrders);

// Admin routes
router.get("/", authenticate, requireAdmin, OrderController.getAllOrders);
router.patch("/:id/status", authenticate, requireAdmin, OrderController.updateStatus);
router.get('/placedOrder', authenticate, requireAdmin, OrderController.countOrder)
export default router;