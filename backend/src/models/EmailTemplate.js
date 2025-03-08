const mongoose = require("mongoose");

const EmailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a template name"],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, "Please add a subject"],
    trim: true,
  },
  body: {
    type: String,
    required: [true, "Please add a template body"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EmailTemplate", EmailTemplateSchema);
