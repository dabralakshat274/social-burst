// const asyncHandler = require("express-async-handler");
// const OTP = require("../models/otpModel");

// const generateOTP = () => "1990";

// const sendPhoneOTPMessage = (phone, otp) => {
//   console.log(`📲 (Mock) Sending static OTP ${otp} to phone number: ${phone}`);
// };

// const sendPhoneOTP = async (phone, otp) => {
//   sendPhoneOTPMessage(phone, otp);
// };

// const verifyPhoneOTP = asyncHandler(async (req, res) => {
//   const { phone, otp } = req.body;

//   if (!phone || !otp) {
//     res.status(400);
//     throw new Error("Phone and OTP are required.");
//   }

//   const otpRecord = await OTP.findOne({ phone });

//   if (!otpRecord) {
//     res.status(404);
//     throw new Error("No OTP record found for this phone.");
//   }

//   if (String(otp) !== "1990") {
//     res.status(400);
//     throw new Error("Invalid OTP. Please use static OTP 1990.");
//   }

//   otpRecord.isPhoneVerified = true;
//   await otpRecord.save();

//   // ✅ Just mark phone verified, no user creation needed here

//   res.status(200).json({
//     success: true,
//     message: "Phone verified successfully",
//   });
// });

// const resendPhoneOTP = asyncHandler(async (req, res) => {
//   const { phone } = req.body;
//   const newOtp = "1990";

//   const otpRecord = await OTP.findOneAndUpdate(
//     { phone },
//     {
//       phoneOtp: newOtp,
//       isPhoneVerified: false,
//       createdAt: Date.now(),
//     },
//     { new: true }
//   );

//   if (!otpRecord) {
//     res.status(400);
//     throw new Error(
//       "OTP session expired or phone not registered. Please register again."
//     );
//   }

//   sendPhoneOTPMessage(phone, newOtp);
//   res.status(200).json({
//     success: true,
//     message: "Static OTP sent to your phone.",
//   });
// });

// module.exports = {
//   sendPhoneOTP,
//   verifyPhoneOTP,
//   resendPhoneOTP,
// };
