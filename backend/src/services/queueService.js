const { emailQueue } = require("../config/queue");
const { sendTemplateEmail } = require("./emailService");
const EmailTemplate = require("../models/EmailTemplate");

// Process queue
emailQueue.process(async (job) => {
  const { recipient, templateId, userId } = job.data;

  try {
    // Get template
    const template = await EmailTemplate.findById(templateId);

    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Send email
    await sendTemplateEmail(
      recipient,
      template.subject,
      template.body,
      templateId,
      userId
    );

    return { success: true, recipient };
  } catch (error) {
    console.error(`Queue job failed for ${recipient}:`, error);
    throw error;
  }
});

// Add email to queue
exports.queueEmail = async (recipient, templateId, userId) => {
  try {
    const job = await emailQueue.add(
      {
        recipient,
        templateId,
        userId,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );

    console.log(`Email queued for ${recipient}, job ID: ${job.id}`);
    return job.id;
  } catch (error) {
    console.error("Queue email error:", error);
    throw error;
  }
};
