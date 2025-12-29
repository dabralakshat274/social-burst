const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const OTP = require("../models/otpModel");
const createError = require("../utils/createError");
const { constants } = require("../constants");
const fs = require("fs");
const path = require("path");

// Generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Generate HTML email template
const generateEmailHtml = (otp, name) => {
  const templatePath = path.join(__dirname, "../template/OTPTemplate.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf8");

  const firstName = name ? name.split(" ")[0] : "User"; // ✅ fallback

  htmlTemplate = htmlTemplate.replace("{{otp}}", otp);
  htmlTemplate = htmlTemplate.replace("{{name}}", firstName);
  return htmlTemplate;
};

// Create reusable email transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.zeptomail.eu", // ✅ new
    port: 587, // ✅ ZeptoMail uses 587
    secure: false, // ✅ use STARTTLS (not SSL)
    auth: {
      user: "emailapikey", // ✅ ZeptoMail fixed username
      pass: process.env.EMAIL_PASS, // ✅ replace with ZeptoMail token (see next step)
    },
  });
};

// Send Email OTP using nodemailer
const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();

  // 👇 Verify transporter connection before sending
  transporter.verify(function (error, success) {
    if (error) {
      console.error(
        "❌ Transporter connection failed:",
        error.message || error
      );
    } else {
      console.log("✅ Transporter is ready to send emails");
    }
  });

  const mailOptions = {
    from: `"Social Burst Team" <noreply@socialburst.co.uk>`,
    to: email,
    subject: "Your OTP for Account Verification",
    html: generateEmailHtml(otp, name),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email OTP sent successfully:", info.response);
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err.message || err);
    throw createError(500, "Failed to send OTP email. Please try again.");
  }
};

// Wrapper for calling sendOTPEmail
const sendEmailOTP = asyncHandler(async (email, otp, name) => {
  await sendOTPEmail(email, otp, name);
});

// Resend Email OTP
const resendEmailOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(constants.VALIDATION_ERROR);
    throw createError(constants.VALIDATION_ERROR, "Email is required.");
  }

  const userOtp = await OTP.findOne({ email });
  if (!userOtp) {
    res.status(constants.NOT_FOUND);
    throw createError(
      constants.NOT_FOUND,
      "No OTP record found for this email."
    );
  }

  const newOtp = generateOTP();

  userOtp.emailOtp = newOtp;
  userOtp.isEmailVerified = false;
  userOtp.createdAt = Date.now();
  await userOtp.save();

  await sendOTPEmail(email, newOtp, userOtp.name);

  res.status(200).json({
    success: true,
    message: "New OTP sent to your email.",
  });
});

// Legacy method — no longer needed in the multi-step registration flow
// Keeping only for backward compatibility if used elsewhere
const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(constants.VALIDATION_ERROR);
    throw createError(
      constants.VALIDATION_ERROR,
      "Email and OTP are required."
    );
  }

  // const TestingOTP = "1234";
  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord) {
    res.status(constants.NOT_FOUND);
    throw createError(constants.NOT_FOUND, "No OTP record found.");
  }

  // if (otpRecord.emailOtp !== otp && otp !== TestingOTP) {
  if (otpRecord.emailOtp !== otp) {
    res.status(constants.VALIDATION_ERROR);
    throw createError(constants.VALIDATION_ERROR, "Invalid or expired OTP.");
  }

  otpRecord.isEmailVerified = true;
  await otpRecord.save();

  res.status(200).json({
    success: true,
    message: "Email OTP verified successfully.",
  });
});

module.exports = {
  sendOTPEmail,
  sendEmailOTP,
  resendEmailOTP,
  verifyEmailOTP,
};
