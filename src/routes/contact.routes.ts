import { Router, type Router as ExpressRouter } from "express";
import { ContactController } from "../controllers/contact.controller";

const router:ExpressRouter = Router();

// Route to create a new contact message
router.post('/', ContactController.createContact);
router.get('/', ContactController.getAllContacts);
router.get('/:contactId', ContactController.getContactById);
router.post('/:contactId/reply', ContactController.replyToContact);
router.patch("/:contactId/read", ContactController.markAsRead);
router.get("/unread/count", ContactController.getUnreadCount);

export default router;