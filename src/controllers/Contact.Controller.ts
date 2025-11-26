import { Request, Response } from 'express';
import Contact, { Reply } from '../models/Contact';
import { sendEmail } from '../utils/mailer';
import { contactReceivedTemplate, adminReplyTemplate } from '../utils/templates';

export class ContactController {
  // POST: create contact
  static async createContact(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, message } = req.body;

      // Save to database
      const contact = new Contact({ firstName, lastName, email, message });
      await contact.save();

      // Send confirmation email to user
      await sendEmail(
        email,
        'We received your message',
        contactReceivedTemplate(firstName, message)
      );

      return res.status(201).json({ success: true, contact });
    } catch (err: any) {
      console.error('Error creating contact:', err);
      return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: err.message || err,
      });
    }
  }

  // GET: all contacts with pagination & search
  static async getAllContacts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const search = (req.query.search as string) || '';
      const searchQuery = search
        ? {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { message: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const total = await Contact.countDocuments(searchQuery);
      const contacts = await Contact.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        success: true,
        page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        contacts,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server Error', error: err });
    }
  }

  // GET: single contact by ID
  static async getContactById(req: Request, res: Response) {
    try {
      const { contactId } = req.params;
      const contact = await Contact.findById(contactId);

      if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }

      res.status(200).json({ success: true, contact });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server Error', error: err });
    }
  }

  // POST: admin replies to a user
  static async replyToContact(req: Request, res: Response) {
  try {
    const { contactId } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || replyMessage.trim() === "") {
      return res.status(400).json({ success: false, message: "Reply message is required" });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    // Save admin reply into DB
    const reply: Reply = {
      message: replyMessage.trim(),
      from: "admin",
      date: new Date(),
    };

    contact.replies.push(reply);
    await contact.save();

    // Send email to the user with the reply
    await sendEmail(
      contact.email,
      "Response from Support",
      adminReplyTemplate(contact.firstName, replyMessage)
    );

    return res.status(200).json({
      success: true,
      message: "Reply sent to user via email",
      contact,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error });
  }
  }

  // Mark contact as read
  static async markAsRead(req: Request, res: Response){
  try {
    const { contactId } = req.params; 
    console.log("Received ID:", contactId);

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    contact.isRead = true;
    await contact.save();

    return res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

  // Get count of unread contacts
 static async getUnreadCount(req: Request, res: Response) {
  try {
    // Count all messages where isRead is false
    const count = await Contact.countDocuments({ isRead: false });
    return res.json({ success: true, unreadCount: count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
}
