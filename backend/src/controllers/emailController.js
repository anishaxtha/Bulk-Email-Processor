const ExcelJS = require("exceljs");
const EmailTemplate = require("../models/EmailTemplate");
const EmailLog = require("../models/EmailLog");
const EmailBatch = require("../models/EmailBatch");
const { v4: uuidv4 } = require("uuid");

// @desc    Process bulk emails
// @route   POST /api/emails/bulk-send
// @access  Private
exports.processBulkEmails = async (req, res) => {
  try {
    const { templateId } = req.body;
    const file = req.file;

    // Validate inputs
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: "Please select an email template",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file with email addresses",
      });
    }

    // Get the template
    const template = await EmailTemplate.findOne({
      _id: templateId,
      user: req.user.id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    // Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: "No worksheet found in the file",
      });
    }

    // Extract email addresses
    const emails = [];
    const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      row.eachCell((cell) => {
        const value = cell.value?.toString().trim();
        if (value && validEmailRegex.test(value)) {
          emails.push(value);
        }
      });
    });

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid email addresses found in the file",
      });
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(emails)];

    // Create batch
    const batchId = uuidv4();
    const batch = await EmailBatch.create({
      batchId,
      user: req.user.id,
      template: template._id,
      totalEmails: uniqueEmails.length,
      status: "processing",
    });

    // Create email logs
    const emailLogs = await Promise.all(
      uniqueEmails.map((email) =>
        EmailLog.create({
          batchId,
          user: req.user.id,
          template: template._id,
          recipient: email,
          subject: template.subject,
          status: "pending",
        })
      )
    );

    res.status(200).json({
      success: true,
      message: `${uniqueEmails.length} emails have been queued for processing`,
      data: {
        batchId: batch.batchId,
        totalEmails: uniqueEmails.length,
        template: template.name,
      },
    });
  } catch (error) {
    console.error("Process bulk emails error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process bulk emails",
    });
  }
};

// @desc    Get email logs
// @route   GET /api/emails/logs
// @access  Private
exports.getEmailLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const total = await EmailLog.countDocuments(filter);
    const logs = await EmailLog.find(filter)
      .populate("template", "name subject")
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error("Get email logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email logs",
    });
  }
};

// @desc    Get email statistics
// @route   GET /api/emails/stats
// @access  Private
exports.getEmailStats = async (req, res) => {
  try {
    const stats = await EmailLog.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      sent: 0,
      failed: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.error("Get email stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch email statistics",
    });
  }
};
