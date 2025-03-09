const express = require("express");
const {
  processBulkEmails,
  getEmailLogs,
  getEmailStats,
} = require("../controllers/emailController");
const { protect } = require("../middleware/auth");

const emailRoutes = express.Router();

emailRoutes.use(protect);

emailRoutes.post("/bulk", processBulkEmails);
emailRoutes.get("/logs", getEmailLogs);
emailRoutes.get("/stats", getEmailStats);

module.exports = emailRoutes;
