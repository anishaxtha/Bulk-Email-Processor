const createTransporter = require("../config/mailtrap");
const EmailLog = require("../models/EmailLog");

// Send verification email
exports.sendVerificationEmail = async (email, verificationUrl, name) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: '"Bulk Email Processor" <noreply@bulkemailprocessor.com>',
      to: email,
      subject: "Please verify your email address",
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Send verification email error:", error);
    throw error;
  }
};

// Send template email
exports.sendTemplateEmail = async (
  recipient,
  subject,
  templateHtml,
  templateId,
  userId
) => {
  try {
    const transporter = createTransporter();

    // Create a log entry first
    const emailLog = await EmailLog.create({
      recipient,
      subject,
      template: templateId,
      sentBy: userId,
      status: "pending",
    });

    // Send the email
    await transporter.sendMail({
      from: '"Bulk Email Processor" <noreply@bulkemailprocessor.com>',
      to: recipient,
      subject: subject,
      html: templateHtml.replace("{{email}}", recipient),
    });

    // Update log with success status
    emailLog.status = "sent";
    emailLog.sentAt = new Date();
    await emailLog.save();

    console.log(`Email sent to ${recipient}`);
    return true;
  } catch (error) {
    console.error(`Send template email error to ${recipient}:`, error);

    // Update log with error status
    try {
      const emailLog = await EmailLog.findOne({
        recipient,
        template: templateId,
        status: "pending",
        sentBy: userId,
      });

      if (emailLog) {
        emailLog.status = "failed";
        emailLog.error = error.message;
        await emailLog.save();
      }
    } catch (logError) {
      console.error("Failed to update email log:", logError);
    }

    throw error;
  }
};
