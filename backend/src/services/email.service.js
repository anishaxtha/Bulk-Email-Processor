const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// creating the nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send verification email
exports.sendVerificationEmail = async (email, verificationUrl, name) => {
  const template = `
      <h1>Email Verification</h1>
      <p>Hello {{name}},</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="{{verificationUrl}}">Verify Email</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;

  const compiledTemplate = Handlebars.compile(template);
  const htmlContent = compiledTemplate({ name, verificationUrl });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Email Verification",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// Send email with a template
exports.sendTemplatedEmail = async (email, subject, templateContent, data) => {
  try {
    // Replace placeholders in the template with actual data
    let compiledTemplate = templateContent;

    // If the template has placeholders, compile it
    if (templateContent.includes("{{")) {
      const template = Handlebars.compile(templateContent);
      compiledTemplate = template({ ...data, email });
    } else {
      // If no placeholders, just ensure the email is included in the body
      if (!compiledTemplate.includes(email)) {
        compiledTemplate += `<p>Sent to: ${email}</p>`;
      }
    }

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject,
      html: compiledTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
