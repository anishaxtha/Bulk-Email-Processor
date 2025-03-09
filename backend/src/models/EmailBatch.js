const mongoose = require("mongoose");

const emailBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      required: true,
    },
    totalEmails: {
      type: Number,
      required: true,
    },
    processedEmails: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailBatch", emailBatchSchema);
