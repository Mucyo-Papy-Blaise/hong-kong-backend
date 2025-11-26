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