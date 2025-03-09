const express = require("express");
const {
  getTemplates,
  getTemplate,
} = require("../controllers/templateController");
const { protect } = require("../middleware/auth");

const templateRoutes = express.Router();

templateRoutes.use(protect);

templateRoutes.route("/").get(getTemplates);
templateRoutes.route("/:id").get(getTemplate);

module.exports = templateRoutes;
