const mongoose = require("mongoose");
const dotenv = require("dotenv");
const EmailTemplate = require("../models/template.model");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Predefined email templates
const templates = [
  {
    name: "Welcome Email",
    subject: "Welcome to Our Platform",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2a3f54;">Welcome to Our Platform!</h1>
        <p>Hello,</p>
        <p>We're thrilled to have you on board. Thank you for joining our platform.</p>
        <p>Here are a few things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our features</li>
          <li>Connect with other users</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Team</p>
        <p style="color: #666; font-size: 12px;">This email was sent to: {{email}}</p>
      </div>
    `,
  },
  {
    name: "Monthly Newsletter",
    subject: "Your Monthly Newsletter",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2a3f54;">Monthly Newsletter</h1>
        <p>Hello,</p>
        <p>Here's what's new this month:</p>
        <h2 style="color: #2a3f54;">Product Updates</h2>
        <p>We've launched several new features to enhance your experience.</p>
        <h2 style="color: #2a3f54;">Industry News</h2>
        <p>Stay up-to-date with the latest trends and developments in the industry.</p>
        <h2 style="color: #2a3f54;">Upcoming Events</h2>
        <p>Don't miss our upcoming webinars and workshops.</p>
        <p>Best regards,<br>The Team</p>
        <p style="color: #666; font-size: 12px;">This email was sent to: {{email}}</p>
      </div>
    `,
  },
  {
    name: "Password Reset",
    subject: "Reset Your Password",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2a3f54;">Reset Your Password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{resetLink}}" style="background-color: #2a3f54; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>{{resetLink}}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Team</p>
        <p style="color: #666; font-size: 12px;">This email was sent to: {{email}}</p>
      </div>
    `,
  },
  {
    name: "Event Invitation",
    subject: "You're Invited!",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2a3f54;">You're Invited!</h1>
        <p>Hello,</p>
        <p>We're excited to invite you to our upcoming event:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
          <h2 style="color: #2a3f54; margin-top: 0;">{{eventName}}</h2>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Location:</strong> {{eventLocation}}</p>
        </div>
        <p>Please RSVP by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{rsvpLink}}" style="background-color: #2a3f54; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">RSVP Now</a>
        </div>
        <p>We hope to see you there!</p>
        <p>Best regards,<br>The Team</p>
        <p style="color: #666; font-size: 12px;">This email was sent to: {{email}}</p>
      </div>
    `,
  },
];

// Seed function
const seedTemplates = async () => {
  try {
    // Clear existing templates
    await EmailTemplate.deleteMany();
    console.log("Deleted existing templates");

    // Insert new templates
    const createdTemplates = await EmailTemplate.insertMany(templates);
    console.log(`Seeded ${createdTemplates.length} email templates`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("MongoDB disconnected");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  }
};

// Run the seeder
seedTemplates();
