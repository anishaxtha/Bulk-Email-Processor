const EmailTemplate = require("../models/EmailTemplate");

// @desc    Create default templates for a user
// @route   POST /api/templates/create-defaults
// @access  Private
exports.createDefaultTemplates = async (req, res) => {
  try {
    const userId = req.user.id;

    // Define default templates
    const defaultTemplates = [
      {
        name: "Welcome Email",
        subject: "Welcome to Our Platform!",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4A5568;">Welcome to Our Platform!</h2>
            <p>Dear {{name}},</p>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            <p>Here are some key features you might want to explore:</p>
            <ul style="list-style-type: none; padding-left: 0;">
              <li>✨ Personalized dashboard</li>
              <li>📊 Analytics tools</li>
              <li>🔔 Real-time notifications</li>
            </ul>
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
        subject: "Your Monthly Newsletter - {{month}} {{year}}",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4A5568;">Monthly Newsletter</h2>
            <p>Hello {{name}},</p>
            <p>Here's your monthly roundup of updates and news!</p>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin-top: 0;">This Month's Highlights</h3>
              <ul style="list-style-type: none; padding-left: 0;">
                <li style="margin-bottom: 10px;">🚀 New features and improvements</li>
                <li style="margin-bottom: 10px;">📈 Platform updates</li>
                <li style="margin-bottom: 10px;">🎯 Tips and best practices</li>
              </ul>
            </div>
            <p>Stay tuned for more updates!</p>
            <div style="margin-top: 30px;">
              <p>Best regards,</p>
              <p><strong>The Newsletter Team</strong></p>
            </div>
          </div>
        `,
      },
      {
        name: "Special Promotion",
        subject: "Special Offer Just for You!",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4A5568;">Special Offer Inside! 🎉</h2>
            <p>Hi {{name}},</p>
            <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2b6cb0; margin-top: 0;">Limited Time Offer!</h3>
              <p style="font-size: 18px; color: #2d3748;">Get <strong>25% off</strong> on your next purchase!</p>
              <p>Use code: <strong>SPECIAL25</strong></p>
              <p style="font-size: 14px; color: #4a5568;">Valid until: {{expiry_date}}</p>
            </div>
            <p>Don't miss out on this amazing opportunity!</p>
            <div style="margin-top: 30px;">
              <p>Best regards,</p>
              <p><strong>The Marketing Team</strong></p>
            </div>
          </div>
        `,
      },
    ];

    // Clear existing templates for the user
    await EmailTemplate.deleteMany({ user: userId });

    // Create new templates
    const createdTemplates = await Promise.all(
      defaultTemplates.map((template) =>
        EmailTemplate.create({
          ...template,
          user: userId,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Default templates created successfully",
      data: createdTemplates,
    });
  } catch (error) {
    console.error("Create default templates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create default templates",
    });
  }
};

// @desc    Get all templates for a user
// @route   GET /api/templates
// @access  Private
exports.getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({ user: req.user.id }).sort(
      "-createdAt"
    );

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
};

// @desc    Get template by ID
// @route   GET /api/templates/:id
// @access  Private
exports.getTemplateById = async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Get template by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
};
