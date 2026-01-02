import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// User routes
router.post("/", authenticate, AppointmentController.createAppointment);
router.get("/my-appointments", authenticate, AppointmentController.getUserAppointments);

// Admin routes
router.get("/", authenticate, requireAdmin, AppointmentController.getAllAppointments);
router.get("/:id", authenticate, requireAdmin, AppointmentController.getAppointmentById);
router.delete("/:id", authenticate, requireAdmin, AppointmentController.deleteAppointment);
router.patch("/:id/status", authenticate, requireAdmin, AppointmentController.updateStatus);

export default router;
    