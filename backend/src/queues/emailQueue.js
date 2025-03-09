const Bull = require("bull");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const EmailTemplate = require("../models/EmailTemplate");
const EmailLog = require("../models/EmailLog");
const sendEmail = require("../utils/sendEmail");

// Create Bull queue
const emailQueue = new Bull("email-processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process emails in the queue
emailQueue.process(async (job) => {
  const { filePath, templateId, userId, batchId } = job.data;

  try {
    // Get email template
    const template = await EmailTemplate.findById(templateId);

    if (!template) {
      throw new Error("Email template not found");
    }

    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    // Column mapping (assuming first row has headers and 'email' is one of them)
    let emailColumnIndex = null;

    // Find the email column
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      if (cell.value && cell.value.toString().toLowerCase() === "email") {
        emailColumnIndex = colNumber;
      }
    });

    if (!emailColumnIndex) {
      throw new Error("Email column not found in Excel file");
    }

    // Process each row (skip header)
    let processedCount = 0;
    const totalRows = worksheet.rowCount - 1;

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const recipientEmail = row.getCell(emailColumnIndex).value;

      // Skip if email is not valid
      if (!recipientEmail || typeof recipientEmail !== "string") {
        continue;
      }

      // Create email log entry
      const emailLog = await EmailLog.create({
        user: userId,
        template: templateId,
        recipient: recipientEmail,
        subject: template.subject,
        status: "pending",
        batchId,
      });

      try {
        // Customize email body with recipient's email
        let customizedBody = template.body.replace("{{email}}", recipientEmail);

        // Send email
        await sendEmail({
          email: recipientEmail,
          subject: template.subject,
          message: customizedBody,
        });

        // Update log with success
        emailLog.status = "success";
        await emailLog.save();
      } catch (error) {
        // Update log with failure
        emailLog.status = "failed";
        emailLog.error = error.message;
        await emailLog.save();
      }

      // Update progress
      processedCount++;

      // Emit progress via Socket.io
      const io = require("../server").io;
      if (io) {
        io.emit("emailProgress", {
          batchId,
          progress: Math.floor((processedCount / totalRows) * 100),
          processed: processedCount,
          total: totalRows,
        });
      }
    }

    // Clean up - delete the file after processing
    fs.unlinkSync(filePath);

    return { success: true, processed: processedCount };
  } catch (error) {
    console.error("Error processing email queue:", error);

    // Update all pending logs for this batch as failed
    await EmailLog.updateMany(
      { batchId, status: "pending" },
      { status: "failed", error: error.message }
    );

    throw error;
  }
});

// Add event listeners
emailQueue.on("completed", (job, result) => {
  console.log(`Batch ${job.data.batchId} completed:`, result);

  // Emit completion event via Socket.io
  const io = require("../server").io;
  if (io) {
    io.emit("emailBatchCompleted", {
      batchId: job.data.batchId,
      result,
    });
  }
});

emailQueue.on("failed", (job, error) => {
  console.error(`Batch ${job.data.batchId} failed:`, error);

  // Emit failure event via Socket.io
  const io = require("../server").io;
  if (io) {
    io.emit("emailBatchFailed", {
      batchId: job.data.batchId,
      error: error.message,
    });
  }
});

// Export function to add jobs to the queue
module.exports = {
  addEmailBatch: async (filePath, templateId, userId) => {
    const batchId = uuidv4();

    // Add job to queue
    const job = await emailQueue.add({
      filePath,
      templateId,
      userId,
      batchId,
    });

    return { jobId: job.id, batchId };
  },
};
