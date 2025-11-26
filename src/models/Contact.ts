import mongoose, { Schema, Document } from 'mongoose';

export type ContactStatus = "read" | "unread";

export interface Reply {
  message: string;
  from: "admin" | "user";
  date: Date;
}


export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  replies: Reply[];
  status: ContactStatus;
  isRead: boolean;  
}

export interface ContactDocument extends Contact, Document {}

const ReplySchema = new Schema<Reply>(
  {
    message: { type: String, required: true },
    from: { type: String, enum: ["admin", "user"], default: "admin" },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ContactSchema = new Schema<ContactDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    replies: { type: [ReplySchema], default: [] },

    // NEW FIELD
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ContactDocument>('Contact', ContactSchema);
