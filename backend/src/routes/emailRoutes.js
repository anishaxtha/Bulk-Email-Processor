const express = require("express");
const multer = require("multer");
const {
  processBulkEmails,
  getEmailLogs,
  getEmailStats,
} = require("../controllers/emailController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
      "application/pdf", // .pdf
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only Excel, CSV, and PDF files are allowed."
        )
      );
    }
  },
});

// Protect all routes
router.use(protect);

// Routes
router.post("/bulk-send", upload.single("file"), processBulkEmails);
router.get("/logs", getEmailLogs);
router.get("/stats", getEmailStats);

module.exports = router;
