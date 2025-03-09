const express = require("express");
const {
  getTemplates,
  getTemplateById,
  createDefaultTemplates,
} = require("../controllers/templateController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.get("/", getTemplates);
router.get("/:id", getTemplateById);
router.post("/create-defaults", createDefaultTemplates);

module.exports = router;
