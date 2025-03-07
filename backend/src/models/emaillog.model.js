const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: [true, "Recipient email is required"],
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please provide a valid email",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      required: [true, "Template reference is required"],
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    batchId: {
      type: String,
      required: [true, "Batch ID is required"],
    },
  },
  { timestamps: true }
);

// Index for faster querying
EmailLogSchema.index({ userId: 1, batchId: 1 });
EmailLogSchema.index({ status: 1 });

module.exports = mongoose.model("EmailLog", EmailLogSchema);
