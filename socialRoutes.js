// routes/auth.js
const express = require("express");
const { socialSignIn } = require("../controllers/socialController");
const router = express.Router();
const { body, validationResult } = require("express-validator");

/**
 * @swagger
 * tags:
 *   - name: Social Authentication
 *     description: Login and registration via social providers (Google, Apple)
 *
 * components:
 *   schemas:
 *     SocialSignInRequest:
 *       type: object
 *       required:
 *         - email
 *         - authType
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john.doe@gmail.com"
 *         phoneNumber:
 *           type: string
 *           example: "9876654352"
 *         deviceId:
 *           type: string
 *           example: "some-device-id"
 *         fcmToken:
 *           type: string
 *           example: "fcm_device_token_ABC123"
 *         appleId:
 *           type: string
 *           example: "apple-id-123"
 *         googleId:
 *           type: string
 *           example: "google-id-123"
 *         authType:
 *           type: string
 *           enum: [google, apple]
 *           example: google
 *
 *     SocialSignInResponseUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         deviceId:
 *           type: string
 *         userType:
 *           type: string
 *         isPhoneVerified:
 *           type: boolean
 *         isProfileComplete:
 *           type: boolean
 *         fcmToken:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *
 *     SocialSignInResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/SocialSignInResponseUser'
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 */

/**
 * @swagger
 * /api/auth/social-signin:
 *   post:
 *     summary: Login or Register via social accounts (Google, Apple)
 *     tags:
 *       - Social Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocialSignInRequest'
 *     responses:
 *       200:
 *         description: Login or Register successful
 *       400:
 *         description: Error in input, missing Google/Apple ID, or invalid userType
 */

router.post(
  "/social-signin",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    // userType intentionally NOT required here; controller will enforce for new users
    body("authType").isIn(["google", "apple"]).withMessage("Invalid authType"),
    // conditional provider id presence
    body().custom((value) => {
      if (!value || !value.authType) {
        throw new Error("authType is required");
      }
      if (value.authType === "google" && !value.googleId) {
        throw new Error("googleId is required when authType is 'google'");
      }
      if (value.authType === "apple" && !value.appleId) {
        throw new Error("appleId is required when authType is 'apple'");
      }
      return true;
    }),
  ],
  // validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  socialSignIn
);

module.exports = router;
