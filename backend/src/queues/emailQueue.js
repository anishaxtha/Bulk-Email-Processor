const Queue = require("bull");
const { v4: uuidv4 } = require("uuid");
// const EmailLog = require("../models/emailLog.model.js");
const { sendTemplatedEmail } = require("../services/email.service");
const EmailTemplate = require("../models/template.model");
const EmailLogSchema = require("../models/emailLog.model.js");

// Create a new queue
const emailQueue = new Queue("email-processing", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Process queue items
emailQueue.process(async (job) => {
  const { recipient, templateId, userId, batchId } = job.data;

  try {
    // Get template from database
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Create a log entry
    const emailLog = new EmailLogSchema({
      recipient,
      subject: template.subject,
      template: templateId,
      status: "pending",
      userId,
      batchId,
    });

    await emailLog.save();

    // Send the email
    const result = await sendTemplatedEmail(
      recipient,
      template.subject,
      template.body,
      { recipient }
    );

    // Update the log with the result
    if (result.success) {
      emailLog.status = "sent";
      emailLog.sentAt = new Date();
    } else {
      emailLog.status = "failed";
      emailLog.error = result.error;
    }

    await emailLog.save();

    // Return the result for the queue
    return { success: result.success, logId: emailLog._id };
  } catch (error) {
    console.error("Error processing email:", error);

    // Log the error
    await EmailLog.findOneAndUpdate(
      { recipient, batchId, userId },
      {
        status: "failed",
        error: error.message,
      }
    );

    throw error;
  }
});

// Add completed and failed event handlers for WebSocket notifications
emailQueue.on("completed", (job, result) => {
  // Here we will emit socket events when implementing WebSockets
  console.log(`Job ${job.id} completed`);
});

emailQueue.on("failed", (job, error) => {
  // Here we will emit socket events when implementing WebSockets
  console.error(`Job ${job.id} failed:`, error);
});

// Add emails to the queue
exports.addToEmailQueue = async (emails, templateId, userId) => {
  const batchId = uuidv4();

  // Add each email to the queue
  const jobs = emails.map((email) => {
    return emailQueue.add({
      recipient: email,
      templateId,
      userId,
      batchId,
    });
  });

  await Promise.all(jobs);

  return { batchId, totalEmails: emails.length };
};

// Get email queue status
exports.getQueueStatus = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
};

module.exports = {
  emailQueue,
  addToEmailQueue,
  getQueueStatus,
};
