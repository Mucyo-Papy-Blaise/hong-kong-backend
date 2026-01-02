const emailLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      color: #ffffff;
      padding: 24px;
      text-align: center;
      font-size: 20px;
      font-weight: 600;
    }
    .content {
      padding: 32px;
      color: #1f2937;
      font-size: 15px;
      line-height: 1.6;
    }
    .content h3 {
      margin-top: 0;
    }
    .info-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    .info-box p {
      margin: 6px 0;
    }
    .footer {
      text-align: center;
      padding: 16px;
      font-size: 13px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${title}</div>
    <div class="content">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Your Company · All rights reserved
    </div>
  </div>
</body>
</html>
`;

export const contactReceivedTemplate = (firstName: string, message: string) => `
  <h2>Hi ${firstName},</h2>
  <blockquote>${message}</blockquote>
`;

export const adminReplyTemplate = (firstName: string, replyMessage: string) => `
  <h2>Hi ${firstName},</h2>
  <p>Our admin replied to your message:</p>
  <blockquote>${replyMessage}</blockquote>
  <p>Thank you for reaching out.</p>
  <p>Best regards,<br/>Your Company</p>
`;

export const appointmentConfirmationTemplate = (
  firstName: string,
  serviceType: string,
  date: string,
  time: string
) =>
  emailLayout(
    "Appointment Confirmed ✅",
    `
    <h3>Hi ${firstName},</h3>
    <p>Your appointment has been successfully scheduled.</p>

    <div class="info-box">
      <p><strong>Service:</strong> ${serviceType}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
    </div>

    <p>If you need to reschedule or have questions, feel free to contact us.</p>
    <p>We look forward to seeing you!</p>

    <p>Best regards,<br/><strong>Your Company</strong></p>
    `
  );

  export const newAppointmentAdminTemplate = (
  firstName: string,
  lastName: string,
  serviceType: string,
  date: string,
  time: string,
  email: string,
  phone: string
) =>
  emailLayout(
    "New Appointment Scheduled 📅",
    `
    <h3>New appointment details</h3>

    <div class="info-box">
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service:</strong> ${serviceType}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
    </div>

    <p>Please log in to the admin dashboard to manage this appointment.</p>
    `
  );
