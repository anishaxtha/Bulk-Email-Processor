import mongoose from "mongoose";

const EmailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a template name"],
      trim: true,
      unique: true,
    },
    subject: {
      type: String,
      required: [true, "Please provide an email subject"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Please provide an email body"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailTemplate", EmailTemplateSchema);
