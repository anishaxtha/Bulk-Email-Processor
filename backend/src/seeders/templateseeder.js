const mongoose = require("mongoose");
const dotenv = require("dotenv");
const EmailTemplate = require("../models/EmailTemplate");
const connectDB = require("../config/db");

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Templates to seed
const templates = [
  {
    name: "Welcome Email",
    subject: "Welcome to Our Platform",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A5568;">Welcome to Our Platform!</h2>
        <p>Hello,</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Your email address ({{email}}) has been successfully registered.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <div style="margin-top: 30px;">
          <p>Best regards,</p>
          <p><strong>The Team</strong></p>
        </div>
      </div>
    `,
  },
  {
    name: "Monthly Newsletter",
    subject: "Your Monthly Newsletter",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A5568;">Your Monthly Newsletter</h2>
        <p>Hello,</p>
        <p>Here's your monthly newsletter with the latest updates and news!</p>
        <ul>
          <li>New feature: Bulk email processing</li>
          <li>Improved user interface</li>
          <li>Bug fixes and performance improvements</li>
        </ul>
        <p>This email was sent to {{email}}.</p>
        <div style="margin-top: 30px;">
          <p>Stay updated!</p>
          <p><strong>The Newsletter Team</strong></p>
        </div>
      </div>
    `,
  },
  {
    name: "Special Offer",
    subject: "Special Offer Just For You",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <h2 style="color: #2D3748;">Special Offer Just For You!</h2>
        <p>Hello,</p>
        <p>We have a special offer just for you!</p>
        <div style="background-color: #EDF2F7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #4A5568; margin-top: 0;">Get 20% off your next purchase</h3>
          <p>Use code: <strong>SPECIAL20</strong></p>
        </div>
        <p>This offer is being sent to {{email}} and expires in 7 days.</p>
        <div style="margin-top: 30px;">
          <p>Don't miss out!</p>
          <p><strong>The Marketing Team</strong></p>
        </div>
      </div>
    `,
  },
];

// Seed function
const seedTemplates = async () => {
  try {
    // Clear existing templates
    await EmailTemplate.deleteMany();
    console.log("Existing templates cleared");

    // Insert new templates
    await EmailTemplate.insertMany(templates);
    console.log(`${templates.length} email templates inserted`);

    // Exit process
    process.exit();
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  }
};

// Run the seeder
seedTemplates();
