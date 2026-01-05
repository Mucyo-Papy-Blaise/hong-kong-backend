import { Request, Response } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/appintment";
import { AuthRequest } from "../types";
import { sendEmail } from "../utils/mailer";
import { appointmentConfirmationTemplate, newAppointmentAdminTemplate } from "../utils/templates";

export class AppointmentController {
  // CREATE appointment
  static createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const { firstName, lastName, email, phone, date, time, serviceType } =
      req.body;

    const isExisting = await Appointment.findOne({
      user: userId,
      serviceType,
      date,
      time,
    });

    if (isExisting) {
      return res.status(400).json({
        success: false,
        error: "Appointment already exists for this time slot. call us to reschedule. +250 788 123 456",
      });
    }


    const appointment = await Appointment.create({
      user: userId,
      firstName,
      lastName,
      email,
      phone,
      date,
      time,
      serviceType,
    });


    // Send emails (non-blocking UX)
    await Promise.all([
      sendEmail(
        email,
        "Your appointment is confirmed",
        appointmentConfirmationTemplate(firstName, serviceType, date, time)
      ),
      sendEmail(
        process.env.ADMIN_EMAIL!,
        "New appointment scheduled",
        newAppointmentAdminTemplate(
          firstName,
          lastName,
          serviceType,
          date,
          time,
          email,
          phone
        )
      ),
    ]);

    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    console.error("createAppointment error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

  // GET appointments of logged-in user
  static getUserAppointments = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      const search = req.query.search?.toString().trim() || "";

      const pipeline: any[] = [];

      pipeline.push({
        $match: { user: new mongoose.Types.ObjectId(userId) },
      });

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { serviceType: { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      pipeline.push({ $sort: { createdAt: -1 } });

      const appointments = await Appointment.aggregate(pipeline);

      res.json({
        success: true,
        appointments,
      });
    } catch (err: any) {
      console.error("getUserAppointments error:", err);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  };

  // GET ALL appointments (Admin)
  static getAllAppointments = async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
      const skip = (page - 1) * limit;

      const search = req.query.search?.toString().trim() || "";

      const pipeline: any[] = [];

      pipeline.push({
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      });

      pipeline.push({
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      });

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { serviceType: { $regex: search, $options: "i" } },
              { "userDetails.email": { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Appointment.aggregate(countPipeline);
      const totalAppointments = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalAppointments / limit);

      pipeline.push({ $sort: { createdAt: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const appointments = await Appointment.aggregate(pipeline);

      const formatted = appointments.map((a) => ({
        _id: a._id,
        user: a.userDetails
          ? {
              id: a.userDetails._id,
              name: a.userDetails.name,
              email: a.userDetails.email,
            }
          : null,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        date: a.date,
        status: a.status,
        adminReply: a.adminReply,
        time: a.time,
        serviceType: a.serviceType,
        createdAt: a.createdAt,
      }));

      res.json({
        success: true,
        pagination: {
          page,
          limit,
          totalAppointments,
          totalPages,
        },
        appointments: formatted,
      });
    } catch (err: any) {
      console.error("getAllAppointments error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch appointments",
      });
    }
  };

  // GET appointment by ID
  static getAppointmentById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id).populate("user");

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: "Appointment not found",
        });
      }

      res.json({ success: true, appointment });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  // PATCH /api/appointments/:id/status
  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, adminReply } = req.body as {
        status?: "approved" | "rejected";
        adminReply?: string;
      };

      const appointment = await Appointment.findById(id);
      if (!appointment)
        return res
          .status(404)
          .json({ success: false, error: "Appointment not found" });

      let emailMessage = "";
      let emailSubject = "";

      // If admin sends only a reply (no status), set status to 'replied'
      if (adminReply && !status) {
        appointment.status = "replied";
        appointment.adminReply = adminReply;

        emailSubject = "Reply from Admin regarding your appointment";
        emailMessage = `Your appointment for ${
          appointment.serviceType
        } on ${appointment.date.toDateString()} at ${
          appointment.time
        } has a reply from admin:<br/><br/>${adminReply}`;
      }

      // If admin sets status (approve/reject)
      if (status) {
        if (!["approved", "rejected"].includes(status)) {
          return res
            .status(400)
            .json({ success: false, error: "Invalid status" });
        }
        appointment.status = status;
        if (adminReply) appointment.adminReply = adminReply;

        emailSubject = `Your Appointment has been ${status}`;
        emailMessage = `Your appointment for ${
          appointment.serviceType
        } on ${appointment.date.toDateString()} at ${
          appointment.time
        } has been ${status}.`;
        if (adminReply)
          emailMessage += `<br/><br/>Admin message: ${adminReply}`;
      }

      await appointment.save();

      // Send email to user
      if (emailMessage) {
        await sendEmail(appointment.email, emailSubject, emailMessage);
      }

      res.json({
        success: true,
        appointment,
        message: "Appointment updated and user notified.",
      });
    } catch (err: any) {
      console.error("updateStatus error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  };

  // DELETE appointment
  static deleteAppointment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByIdAndDelete(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: "Appointment not found",
        });
      }

      res.json({ success: true, message: "Appointment deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
