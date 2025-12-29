const express = require("express");
const {
  registerUser,
  verifyEmailOTP,
  resendEmailOTP,
  loginUser,
  currentUser,
  refreshAccessToken,
  logoutUser,
  deleteUser,
  changePassword,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  getAllUsers,
  initiateRegistration,
  checkUniqueContact,
  verifyRegistrationOTP,
  setRegistrationPassword,
  toggleFollowerNotification,
  followUser,
  unfollowUser,
  updateUserProfile,
  updateFcmToken,
  getUserProfile,
  getUserCalendar,
  addEventToCalendar,
  removeEventFromCalendar,
  getUserFollowedEvents,
  createBusinessProfile,
  verifyBusinessPhoneOTP,
  saveEvent,
  removeSavedEvent,
  getSavedEvents,
  getMyEventImages,
  getUserProfileById,
  applyReferralCode,
  getFriends,
} = require("../controllers/userController");
const { getBusinessProfiles } = require("../controllers/admin_Controller");

const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user authentication and management
 */

/**
 * @swagger
 * /api/users/check-unique:
 *   post:
 *     summary: Check whether email and/or phone are unique (not already registered)
 *     tags: [Users]
 *     description: |
 *       Send email and/or phone in the request body to check uniqueness.
 *       At least one of the fields is required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "9345678902"
 *     responses:
 *       200:
 *         description: Returns whether provided values exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     emailProvided:
 *                       type: boolean
 *                     phoneProvided:
 *                       type: boolean
 *                     emailExists:
 *                       type: boolean
 *                     phoneExists:
 *                       type: boolean
 *                     unique:
 *                       type: boolean
 *       400:
 *         description: Missing both email and phone in request
 */
router.post("/check-unique", checkUniqueContact);

/**
 * @swagger
 * /api/users/initiate-registration/unique:
 *   post:
 *     summary: Initiate user registration
 *     tags: [Users]
 *     description: |
 *       Takes name, email, phone, password and confirmPassword.
 *       Sends OTP to the provided email after validating credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - E_Mai_l
 *               - phone
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               E_Mai_l:
 *                 type: string
 *                 example: "john@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "9345678902"
 *               fcmToken:
 *                 type: string
 *                 example: "abc123xyz-device-token"
 *               password:
 *                 type: string
 *                 example: "Pass@123"
 *               confirmPassword:
 *                 type: string
 *                 example: "Pass@123"
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Invalid or missing fields
 */
router.post(
  "/initiate-registration/unique",
  (req, res, next) => {
    console.log(" INITIATE REGISTRATION route hit");
    next();
  },
  initiateRegistration
);

/**
 * @swagger
 * /api/users/verify-registration-otp/verify:
 *   post:
 *     summary: Verify OTP and get token
 *     tags: [Users]
 *     description: Verifies email OTP and returns access/refresh tokens to continue registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - E_Mai_l
 *               - otp
 *             properties:
 *               E_Mai_l:
 *                 type: string
 *                 example: "john@gmail.com"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified, tokens issued
 */
router.post("/verify-registration-otp/verify", verifyRegistrationOTP);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Complete registration (with profile setup)
 *     tags: [Users]
 *     description: |
 *       Finalizes user registration after verifying OTP.
 *       - If userType ≠ "business", businessType must not be provided.
 *       - businessType is optional for userType = "business".
 *       - businessSubCategory is optional for userType = "business".
 *       - businessImages are optional, only send them when userType = "business" and businessType = "businessPartner".
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userType
 *               - deviceId
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: ["admin", "user", "business"]
 *               businessType:
 *                 type: string
 *                 enum: ["bidPartner", "businessPartner"]
 *                 description: Optional, only applicable if userType = "business"
 *               businessSubCategory:
 *                 type: string
 *                 pattern: "^[a-fA-F0-9]{24}$"
 *                 example: ""
 *                 description: Optional, only applicable if userType = "business"
 *               businessImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Up to 5 gallery images (optional, only when businessType = \"businessPartner\")"
 *               deviceId:
 *                 type: string
 *                 example: "a1b26"
 *                 description: "Client device identifier (required for all accounts)"
 *               latitude:
 *                 type: number
 *                 example: 40.7128
 *                 description: "Current latitude (optional)"
 *               longitude:
 *                 type: number
 *                 example: -74.0060
 *                 description: "Current longitude (optional)"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: "Profile image file (required when userType = \"business\", optional otherwise)"
 *               address:
 *                 type: string
 *                 example: "123 Main St."
 *                 description: "Street address (optional)"
 *               radius:
 *                 type: number
 *                 example: 10
 *                 description: "Preferred service radius in miles/km (optional)"
 *               links:
 *                 type: string
 *                 example: '{"instagram":"https://instagram.com/myprofile","facebook":"https://facebook.com/myprofile"}'
 *                 description: "JSON string describing social links (optional)"
 *               city:
 *                 type: string
 *                 example: "Mountain View"
 *                 description: "City name (optional)"
 *               state:
 *                 type: string
 *                 example: "California"
 *                 description: "State name (optional)"
 *               zipCode:
 *                 type: string
 *                 example: "94043"
 *                 description: "Postal/ZIP code (optional)"
 *               country:
 *                 type: string
 *                 example: "United States"
 *                 description: "Country (optional)"
 *               location:
 *                 type: string
 *                 example: "Mountain View, California, United States"
 *                 description: "Full location string (optional)"
 *     responses:
 *       201:
 *         description: Registration completed
 */
router.post(
  "/register",
  validateToken,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "businessImages", maxCount: 5 },
  ]),
  registerUser
);

// router.post("/register", registerUser);

// /**
//  * @swagger
//  * /api/users/verify-email-otp:
//  *   post:
//  *     summary: Verify Email OTP
//  *     tags: [Users]
//  *     description: Verifies the OTP sent to the user's email and marks email as verified.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - otp
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 example: "john@gmail.com"
//  *               otp:
//  *                 type: string
//  *                 example: "1234"
//  *     responses:
//  *       200:
//  *         description: Email verified successfully.
//  */
// router.post("/verify-email-otp", verifyEmailOTP);

/**
 * @swagger
 * /api/users/resend-email-otp:
 *   post:
 *     summary: Resend Email OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@gmail.com"
 *     responses:
 *       200:
 *         description: New OTP sent to email.
 */
router.post("/resend-email-otp", resendEmailOTP);

/**
 * @swagger
 * /api/users/login/user:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     description: Authenticates a user and returns JWT access/refresh tokens.
 *                  Updates deviceId and fcmToken if provided.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - E_Mai_l
 *               - password
 *               - deviceId
 *             properties:
 *               E_Mai_l:
 *                 type: string
 *                 example: "john@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Pass@123"
 *               deviceId:
 *                 type: string
 *                 example: "BN0034"
 *               fcmToken:
 *                 type: string
 *                 description: Firebase Cloud Messaging token for push notifications
 *                 example: "fcm_token_from_client"
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login/user", loginUser);

/**
 * @swagger
 * /api/users/current:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 */
router.get(
  "/current",
  validateToken,
  authorizeRoles("Admin", "User", "Business"),
  currentUser
);

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Generate new access token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token refreshed
 */
router.post("/refresh-token", validateToken, refreshAccessToken);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout the user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", validateToken, authorizeRoles("user"), logoutUser);

/**
 * @swagger
 * /api/users/forgot-password/request-otp:
 *   post:
 *     summary: Request OTP for password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - E_Mai_l
 *             properties:
 *               E_Mai_l:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post("/forgot-password/request-otp", requestPasswordResetOtp);

/**
 * @swagger
 * /api/users/forgot-password/verify-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - E_Mai_l
 *               - otp
 *             properties:
 *               E_Mai_l:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);

/**
 * @swagger
 * /api/users/forgot-password/reset:
 *   post:
 *     summary: Reset password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post("/forgot-password/reset", resetPassword);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change current password
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post(
  "/change-password",
  validateToken,
  authorizeRoles("user", "admin"),
  changePassword
);

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete current user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete("/delete", validateToken, authorizeRoles("user"), deleteUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination, filter, and search (public)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example:
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [admin, user, business]
 *         example: user
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         example: createdAt
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get(
  "/",
  validateToken,
  authorizeRoles("user", "admin"),
  getAllUsers //  public route now
);

// router.get(
//   "/",
//   validateToken,
//   // authorizeRoles("Admin"),
//   getAllUsers
// );

/**
 * @swagger
 * /api/users/following/{followedUserId}/notifications:
 *   patch:
 *     summary: Toggle notification preference for a followed user
 *     tags: [Users]
 *     description: |
 *       Allows a follower (logged-in user) to enable or disable notifications
 *       for a specific user they follow.
 *       - The `followedUserId` is provided in the URL path.
 *       - The request body must contain a boolean field `enabled` (true or false).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followedUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user you are following
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Notification preference updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification preference updated to false for followed user"
 *       400:
 *         description: Invalid input (enabled must be boolean)
 *       404:
 *         description: Follow relationship not found
 */
router.patch(
  "/following/:followedUserId/notifications",
  validateToken,
  authorizeRoles("user"),
  toggleFollowerNotification
);

/**
 * @swagger
 * /api/users/friends:
 *   get:
 *     summary: Get mutual friends (users who follow each other)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         example: createdAt
 *     responses:
 *       200:
 *         description: List of friends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       profileImage:
 *                         type: string
 */
router.get("/friends", validateToken, authorizeRoles("user"), getFriends);

/**
 * @swagger
 * /api/users/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     description: Allows a user to follow another user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followId
 *             properties:
 *               followId:
 *                 type: string
 *                 example: "603c72efcb2f5d3f5c47bc6c"
 *     responses:
 *       200:
 *         description: Successfully followed the user.
 *       400:
 *         description: Already following or invalid user.
 */
router.post("/follow", validateToken, authorizeRoles("user"), followUser);

/**
 * @swagger
 * /api/users/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     description: Allows a user to unfollow another user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unfollowId
 *             properties:
 *               unfollowId:
 *                 type: string
 *                 example: "603c72efcb2f5d3f5c47bc6c"
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user.
 *       400:
 *         description: Not following or invalid user.
 */
router.post("/unfollow", validateToken, authorizeRoles("user"), unfollowUser);

/**
 * @swagger
 * /api/users/apply-referral:
 *   post:
 *     summary: Apply a referral code to link with an inviter
 *     tags: [Users]
 *     description: |
 *       Allows an authenticated user to apply a referral code to establish a referral relationship.
 *       - The user must be authenticated (JWT token required)
 *       - Each user can only use one referral code (cannot change inviter once set)
 *       - Users cannot use their own invite code
 *       - The inviter will receive a notification when a referral is applied
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 example: "ABC12345"
 *                 description: 8-character alphanumeric referral code
 *                 pattern: "^[A-Z0-9]{8}$"
 *     responses:
 *       200:
 *         description: Referral code applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Referral code applied successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     invitedBy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                           nullable: true
 *                         inviteCode:
 *                           type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         invitedBy:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *       400:
 *         description: |
 *           Bad request. Possible reasons:
 *           - Invite code is required
 *           - Invalid invite code format
 *           - User already has an inviter
 *           - Invalid invite code (not found)
 *           - Cannot use own invite code
 *           - Referral already applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You have already used a referral code. Each user can only use one referral code."
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *       404:
 *         description: User not found
 */
router.post(
  "/apply-referral",
  validateToken,
  authorizeRoles("user"),
  applyReferralCode
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Fetches the profile of the currently authenticated user using the token.
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User profile fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+1234567890"
 *                     profileImage:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/image.jpg"
 *                     followersCount:
 *                       type: integer
 *                       example: 150
 *                     followingCount:
 *                       type: integer
 *                       example: 75
 *                     friendsCount:
 *                       type: integer
 *                       example: 50
 *                     friendsList:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["60e6c0b0c1302b3a2b5e7e1c", "60e6c0b0c1302b3a2b5e7e1d"]
 *                     followingList:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["60e6c0b0c1302b3a2b5e7e1c"]
 *                     followersList:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["60e6c0b0c1302b3a2b5e7e1c"]
 *                     links:
 *                       type: object
 *                       properties:
 *                         instagram:
 *                           type: string
 *                           example: "https://instagram.com/user"
 *                         facebook:
 *                           type: string
 *                           example: "https://facebook.com/user"
 *                         meta:
 *                           type: string
 *                           example: "https://meta.com/user"
 *                     businessSubCategory:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                     businessCategory:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                     businessImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                       example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *       401:
 *         description: Unauthorized
 */

router.get("/profile", validateToken, authorizeRoles("user"), getUserProfile);

// router.get("/profile/:userId", getUserProfile);

/**
 * @swagger
 * /api/users/update-profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               radius:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put(
  "/update-profile",
  validateToken,
  authorizeRoles("user"),
  upload.single("profileImage"),
  updateUserProfile
);

/**
 * @swagger
 * /api/users/update-fcm-token:
 *   post:
 *     summary: Update FCM Token
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: "fcm-token-from-device"
 *     responses:
 *       200:
 *         description: FCM token updated
 */
router.post(
  "/update-fcm-token",
  validateToken,
  authorizeRoles("user", "admin", "business"),
  updateFcmToken
);

/**
 * @swagger
 * /api/users/calendar/add:
 *   post:
 *     summary: Add an event to the user's calendar
 *     tags: [Calendar]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: "60e6c0b0c1302b3a2b5e7e1c"
 *     responses:
 *       200:
 *         description: Event added to calendar successfully
 *       400:
 *         description: Event already in calendar or missing event ID
 *       404:
 *         description: Event or user not found
 */
router.post(
  "/calendar/add",
  validateToken,
  authorizeRoles("user"),
  addEventToCalendar
);

/**
 * @swagger
 * /api/users/calendar/remove:
 *   delete:
 *     summary: Remove an event from the user's calendar
 *     tags: [Calendar]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: "60e6c0b0c1302b3a2b5e7e1c"
 *     responses:
 *       200:
 *         description: Event removed from calendar successfully
 *       404:
 *         description: Event not found in calendar
 */
router.delete(
  "/calendar/remove",
  validateToken,
  authorizeRoles("user"),
  removeEventFromCalendar
);

/**
 * @swagger
 * /api/users/calendar:
 *   get:
 *     summary: Get all events in the user's calendar
 *     description: Returns paginated calendar events with optional `dateFrom` filter applied on `startDate`.
 *     tags: [Calendar]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional ISO date (YYYY-MM-DD). When provided, only events occurring on that specific day are returned.
 *         example: "2025-01-15"
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional month selector (any ISO date within the desired month). When provided, events from that month are returned. If both `date` and `month` are provided, `date` takes precedence.
 *         example: "2025-01-01"
 *     responses:
 *       200:
 *         description: Calendar events fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventId:
 *                         type: string
 *                         example: "60e6c0b0c1302b3a2b5e7e1c"
 *                       title:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: No events found in calendar
 */
router.get("/calendar", validateToken, authorizeRoles("user"), getUserCalendar);

/**
 * @swagger
 * /api/users/followed-events:
 *   get:
 *     summary: Get all followed events of the user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of events the user is following
 *       404:
 *         description: No followed events found
 */
router.get(
  "/followed-events",
  validateToken,
  authorizeRoles("user"),
  getUserFollowedEvents
);

/**
 * @swagger
 * /api/users/save-event/{eventId}:
 *   post:
 *     summary: Save event for current user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event to save
 *     responses:
 *       200:
 *         description: Event saved successfully
 *       400:
 *         description: Event already saved or invalid input
 *       404:
 *         description: User or event not found
 */
router.post(
  "/save-event/:eventId",
  validateToken,
  authorizeRoles("user"),
  saveEvent
);

/**
 * @swagger
 * /api/users/remove-saved-event/{eventId}:
 *   delete:
 *     summary: Remove event from saved list
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event to remove from saved list
 *     responses:
 *       200:
 *         description: Event removed from saved list
 *       404:
 *         description: Event not found in saved list or user not found
 */
router.delete(
  "/remove-saved-event/:eventId",
  validateToken,
  authorizeRoles("user"),
  removeSavedEvent
);

/**
 * @swagger
 * /api/users/saved-events:
 *   get:
 *     summary: Get all saved events for current user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved events
 */
router.get(
  "/saved-events",
  validateToken,
  authorizeRoles("user"),
  getSavedEvents
);

/**
 * @swagger
 * /api/users/business-profiles:
 *   get:
 *     summary: Get business profiles with filters (public)
 *     description: >
 *       Returns the same business profile listing available to admins, including pagination, search,
 *       category filters, status filters, event filters, and gallery image filters. All data returned
 *       is limited to business users only and includes their associated events summary.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: profileId
 *         schema:
 *           type: string
 *         description: Fetch a specific business profile by ID (skips pagination when provided)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Global search over name, email, and phone
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (ignored when profileId is provided)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size for pagination (ignored when profileId is provided)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order for results
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field used for sorting results
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [bidPartner, businessPartner]
 *         description: Filter by business type
 *       - in: query
 *         name: businessSubCategoryId
 *         schema:
 *           type: string
 *         description: Filter by business subcategory ID
 *       - in: query
 *         name: businessCategoryId
 *         schema:
 *           type: string
 *         description: Filter by parent business category ID
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city (case-insensitive)
 *       - in: query
 *         name: fundingStatus
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter bid partners by funding status
 *       - in: query
 *         name: isPartnershipActive
 *         schema:
 *           type: boolean
 *         description: Filter bid partners by partnership active flag
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by business account active status
 *       - in: query
 *         name: isEmailVerified
 *         schema:
 *           type: boolean
 *         description: Filter by email verification status
 *       - in: query
 *         name: isPhoneVerified
 *         schema:
 *           type: boolean
 *         description: Filter by phone verification status
 *       - in: query
 *         name: isSubscribed
 *         schema:
 *           type: boolean
 *         description: Filter by subscription flag
 *       - in: query
 *         name: isProfileComplete
 *         schema:
 *           type: boolean
 *         description: Filter by profile completion status
 *       - in: query
 *         name: isProfileSetup
 *         schema:
 *           type: boolean
 *         description: Filter by profile setup status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter businesses created on or after this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter businesses created on or before this date
 *       - in: query
 *         name: eventDateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter related events with startDate on or after this date
 *       - in: query
 *         name: eventDateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter related events with startDate on or before this date
 *       - in: query
 *         name: eventStatus
 *         schema:
 *           type: string
 *           enum: [draft, published, canceled, completed]
 *         description: Filter related events by status
 *       - in: query
 *         name: eventVisibility
 *         schema:
 *           type: string
 *           enum: [public, private]
 *         description: Filter related events by visibility
 *       - in: query
 *         name: minEvents
 *         schema:
 *           type: integer
 *         description: Filter businesses with at least this number of related events
 *       - in: query
 *         name: maxEvents
 *         schema:
 *           type: integer
 *         description: Filter businesses with at most this number of related events
 *       - in: query
 *         name: hasBusinessImages
 *         schema:
 *           type: boolean
 *         description: Filter by presence of gallery images (business partners only)
 *     responses:
 *       200:
 *         description: Business profiles fetched successfully
 */
router.get(
  "/business-profiles",
  (req, res, next) => {
    req.allowBusinessProfilesAccess = true;
    next();
  },
  validateToken,
  authorizeRoles("user", "admin", "business"),
  getBusinessProfiles
);

/**
 * @swagger
 * /api/users/my-attendee-images:
 *   get:
 *     summary: Get all event images (URLs only) for events where the logged-in user is an attendee
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of events with image URL arrays
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Event images fetched successfully" }
 *                 totalEvents: { type: integer, example: 2 }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       event:
 *                         type: object
 *                         properties:
 *                           id: { type: string, example: "68ade964c0b0d8a5e745d7e3" }
 *                           title: { type: string, example: "Startup Pitch Night" }
 *                           description: { type: string }
 *                           location: { type: string }
 *                           startDate: { type: string, format: date-time }
 *                           endDate: { type: string, format: date-time }
 *                           imagePath: { type: string, nullable: true }
 *                           visibility: { type: string, example: "private" }
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: "https://cdn.example.com/eventUserImages/abc.jpg"
 */

router.get(
  "/my-attendee-images",
  validateToken,
  authorizeRoles("user"),
  getMyEventImages
);

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   get:
 *     summary: Get public profile by userId (includes event listings)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose profile to fetch
 *     responses:
 *       200:
 *         description: User profile and event listings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                       nullable: true
 *                     followersCount:
 *                       type: integer
 *                     followingCount:
 *                       type: integer
 *                     friendsCount:
 *                       type: integer
 *                     eventsCreated:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           title: { type: string }
 *                           startDate: { type: string, format: date-time }
 *                           endDate: { type: string, format: date-time }
 *                           location: { type: string }
 *                           attendeeCount: { type: integer }
 *                           eventCategory: { type: string, nullable: true }
 *                     eventsAttending:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string }
 *                           title: { type: string }
 *                           startDate: { type: string, format: date-time }
 *                           endDate: { type: string, format: date-time }
 *                           location: { type: string }
 *                           attendeeCount: { type: integer }
 *                           eventCategory: { type: string, nullable: true }
 *       400:
 *         description: Invalid userId
 *       404:
 *         description: User not found
 */
router.get(
  "/:userId/profile",
  validateToken,
  authorizeRoles("user", "admin", "business"),
  getUserProfileById
);

module.exports = router;
