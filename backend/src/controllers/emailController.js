const multer = require("multer");
const ExcelJS = require("exceljs");
const { queueEmail } = require("../services/queueService");
const EmailLog = require("../models/EmailLog");

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel file
      "application/vnd.ms-excel", // Older Excel file
      "application/pdf", // PDF file
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel and PDF files are allowed"), false);
    }
  },
}).single("file");

// @desc    Process bulk emails
// @route   POST /api/emails/bulk
// @access  Private
exports.processBulkEmails = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload an Excel file",
        });
      }

      // Check for template ID
      const { templateId } = req.body;
      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: "Please select an email template",
        });
      }

      // Parse Excel file using ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        return res.status(400).json({
          success: false,
          message: "No worksheet found in the file",
        });
      }

      // Extract email addresses
      const emails = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        row.eachCell((cell) => {
          const value = cell.value?.toString().trim();
          if (value && value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            emails.push(value);
          }
        });
      });

      if (!emails.length) {
        return res.status(400).json({
          success: false,
          message: "No valid email addresses found in the file",
        });
      }

      // Queue emails
      const uniqueEmails = [...new Set(emails)]; // Remove duplicates
      const userId = req.user.id;

      for (const email of uniqueEmails) {
        await queueEmail(email, templateId, userId);
      }

      res.status(200).json({
        success: true,
        message: `${uniqueEmails.length} emails have been queued for processing`,
        count: uniqueEmails.length,
      });
    } catch (error) {
      console.error("Process bulk emails error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });
};

// @desc    Get email logs
// @route   GET /api/emails/logs
// @access  Private
exports.getEmailLogs = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filter by status if provided
    const filter = { user: req.user.id };
    if (req.query.status && req.query.status !== "all") {
      // Map frontend status to backend status
      const statusMap = {
        success: "sent",
        failed: "failed",
        pending: "pending",
        processing: "processing",
      };
      filter.status = statusMap[req.query.status] || req.query.status;
    }

    // Get total count for pagination
    const total = await EmailLog.countDocuments(filter);

    // Get logs with pagination
    const logs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("template", "name subject");

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: logs.map((log) => ({
        ...log.toObject(),
        status: log.status === "sent" ? "success" : log.status, // Map backend status to frontend status
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRecords: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get email logs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get email log statistics
// @route   GET /api/emails/stats
// @access  Private
exports.getEmailStats = async (req, res) => {
  try {
    const stats = await EmailLog.aggregate([
      { $match: { user: req.user._id } }, // Changed from sentBy to user
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the statistics
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
      message: "Server error",
    });
  }
};
