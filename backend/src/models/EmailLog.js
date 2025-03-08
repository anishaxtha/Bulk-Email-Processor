const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmailTemplate",
    required: true,
  },
  batchId: {
    type: String,
    required: true,
    index: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  errorMessage: {
    type: String,
  },
  sentAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for faster queries
EmailLogSchema.index({ batchId: 1, status: 1 });

module.exports = mongoose.model("EmailLog", EmailLogSchema);
