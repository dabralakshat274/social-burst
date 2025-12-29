const express = require("express");
const {
  loginAdmin,
  createBusinessProfile,
  updateBusinessProfile,
  togglePartnershipStatus,
  createEventForBusiness,
  updateEventForBusiness,
  deleteEventByAdmin,
  getUsers,
  updateUserStatus,
  getReports,
  deleteReport,
  getAdminHome,
  getAllUsers,
  getUsersFilter,
  getAllEvents,
  getEventByIdForAdmin,
  getAdminAnalytics,
  getAdminCities,
  getBusinessProfiles,
  getBusinessNames,
  getBidNames,
  getUserById,
  updateUserPasswordByAdmin,
} = require("../controllers/admin_Controller");

const {
  getReportById,
  updateReport,
} = require("../controllers/report_Controller");
const { deleteUserByAdmin } = require("../controllers/userController");
const {
  createBusinessCategory,
  getCategoriesSimple,
  updateBusinessCategory,
  deleteBusinessCategory,
  createBusinessSubCategory,
  updateBusinessSubCategory,
  deleteBusinessSubCategory,
} = require("../controllers/businessCategory_Controller");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @swagger
 * /api/admin/login/admin:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin user with email and password
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - E_Mai_l
 *               - password
 *             properties:
 *               E_Mai_l:
 *                 type: string
 *                 format: email
 *                 example: "admin@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Pass@123"
 *               fcmToken:
 *                 type: string
 *                 description: Optional FCM token for push notifications
 *                 example: "xyz123fcmToken"
 *     responses:
 *       200:
 *         description: Admin login successful
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
 *                   example: "Admin login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         userType:
 *                           type: string
 *                           example: "admin"
 *                         fcmToken:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials or not an admin user
 */
router.post("/login/admin", loginAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API endpoints for admin operations
 */

/**
 * @swagger
 * /api/admin/create-business-profile:
 *   post:
 *     summary: Create business profile
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - userType
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Business Owner"
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *                 description: "Optional for business"
 *               email:
 *                 type: string
 *                 example: "business@domain.com"
 *               address:
 *                 type: string
 *                 example: "123 Business St."
 *                 description: "Optional for business"
 *               userType:
 *                 type: string
 *                 enum: [business, user]
 *                 example: "business"
 *               businessType:
 *                 type: string
 *                 enum: ["bidPartner", "businessPartner"]
 *                 description: Required only if userType = "business"
 *               businessSubCategory:
 *                 type: string
 *                 pattern: "^[a-fA-F0-9]{24}$"
 *                 example: "64a7b2f5e4b0c8a1d2e3f456"
 *                 description: "Required when businessType = \"businessPartner\"; optional when businessType = \"bidPartner\""
 *               businessImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Up to 5 gallery images (optional, only when businessType = \"businessPartner\")"
 *               businessLogo:
 *                 type: string
 *                 format: binary
 *                 description: "Business logo image (single file, optional, only when businessType = \"businessPartner\")"
 *               postCode:
 *                 type: string
 *                 example: "12345"
 *                 description: "Postal code (optional, only when businessType = \"businessPartner\")"
 *               personName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: "Contact person name (optional, only for business users)"
 *               associatedWebsite:
 *                 type: string
 *                 example: "https://www.example.com"
 *                 description: "Business website URL (optional, only for business users)"
 *               openingHours:
 *                 type: string
 *                 example: '[{"day":"Monday","openTime":"2024-01-01T09:00:00.000Z","closeTime":"2024-01-01T21:00:00.000Z","isClosed":false},{"day":"Tuesday","openTime":"2024-01-01T09:00:00.000Z","closeTime":"2024-01-01T21:00:00.000Z","isClosed":false}]'
 *                 description: "JSON string array of opening hours with day, openTime (ISO 8601 date), closeTime (ISO 8601 date), and isClosed (optional, only when businessType = \"businessPartner\")"
 *               notes:
 *                 type: string
 *                 example: "Additional business notes"
 *                 description: "Additional notes about the business (optional, only for business users)"
 *               password:
 *                 type: string
 *                 example: "Password@123"
 *                 description: "Optional for business; if provided, must meet strength policy"
 *               confirmPassword:
 *                 type: string
 *                 example: "Password@123"
 *                 description: "Optional for business; required if password is provided"
 *               fcmToken:
 *                 type: string
 *                 example: "xyz123fcmToken"
 *               latitude:
 *                 type: number
 *                 example: 40.7128
 *                 description: "Optional for business"
 *               longitude:
 *                 type: number
 *                 example: -74.0060
 *                 description: "Optional for business"
 *               radius:
 *                 type: string
 *                 example: "10"
 *               links:
 *                 type: string
 *                 example: '{"instagram":"https://instagram.com/mybusiness","facebook":"https://facebook.com/mybusiness"}'
 *                 description: "JSON string describing social links (optional, optional for business)"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: "Profile image file (optional)"
 *               city:
 *                 type: string
 *                 example: "London"
 *                 description: "City name (optional, only when businessType = \"bidPartner\")"
 *               fundingStatus:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: "pending"
 *                 description: "Funding approval status (optional, only when businessType = \"bidPartner\")"
 *               partnershipStartDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00.000Z"
 *                 description: "Partnership start date in ISO 8601 format (optional, only when businessType = \"bidPartner\")"
 *               isPartnershipActive:
 *                 type: boolean
 *                 example: true
 *                 description: "Whether the partnership is currently active (optional, only when businessType = \"bidPartner\")"
 *     responses:
 *       201:
 *         description: Business profile created successfully
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
 *                   example: "Business profile created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         address:
 *                           type: string
 *                           nullable: true
 *                         profileImage:
 *                           type: string
 *                           nullable: true
 *                         businessType:
 *                           type: string
 *                           nullable: true
 *                         businessCategory:
 *                           type: object
 *                           nullable: true
 *                         businessSubCategory:
 *                           type: object
 *                           nullable: true
 *       400:
 *         description: Required fields missing or invalid data
 *       403:
 *         description: Unauthorized, only admin can create business profiles
 */
router.post(
  "/create-business-profile",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "businessLogo", maxCount: 1 },
    { name: "businessImages", maxCount: 5 }
  ]),
  validateToken,
  authorizeRoles("admin"),
  createBusinessProfile
);


/**
 * @swagger
 * /api/admin/update-business-profile/{id}:
 *   put:
 *     summary: Update business profile (partial update - only sent fields will be updated)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business/User ID to update
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Business Name"
 *               phone:
 *                 type: string
 *                 example: "12345678901"
 *                 description: "Must be 11-14 digits"
 *               email:
 *                 type: string
 *                 example: "updated@business.com"
 *               address:
 *                 type: string
 *                 example: "Updated Address"
 *               latitude:
 *                 type: number
 *                 example: 40.7128
 *               longitude:
 *                 type: number
 *                 example: -74.0060
 *               radius:
 *                 type: number
 *                 example: 25
 *               links:
 *                 type: string
 *                 example: '{"instagram":"https://instagram.com/business","facebook":"https://facebook.com/business"}'
 *                 description: "JSON string of social links"
 *               businessType:
 *                 type: string
 *                 enum: [bidPartner, businessPartner]
 *                 description: "Only for business users"
 *               businessSubCategory:
 *                 type: string
 *                 pattern: "^[a-fA-F0-9]{24}$"
 *                 example: "64a7b2f5e4b0c8a1d2e3f456"
 *                 description: "Only for business users"
 *               postCode:
 *                 type: string
 *                 example: "12345"
 *                 description: "Only when businessType = \"businessPartner\""
 *               personName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: "Only for business users"
 *               associatedWebsite:
 *                 type: string
 *                 example: "https://www.example.com"
 *                 description: "Only for business users, must be valid URL"
 *               openingHours:
 *                 type: string
 *                 example: '[{"day":"Monday","openTime":"2024-01-01T09:00:00.000Z","closeTime":"2024-01-01T21:00:00.000Z","isClosed":false}]'
 *                 description: "JSON string array of opening hours with day, openTime (ISO 8601 date), closeTime (ISO 8601 date), and isClosed (only when businessType = \"businessPartner\")"
 *               notes:
 *                 type: string
 *                 example: "Updated business notes"
 *                 description: "Only for business users"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: "Profile image file"
 *               businessLogo:
 *                 type: string
 *                 format: binary
 *                 description: "Business logo file (only when businessType = \"businessPartner\")"
 *               businessImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Additional business images (only when businessType = \"businessPartner\", appended to existing)"
 *     responses:
 *       200:
 *         description: Business profile updated successfully
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
 *                   example: "Business profile updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         email:
 *                           type: string
 *                         address:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *                         radius:
 *                           type: number
 *                         links:
 *                           type: object
 *                         businessCategory:
 *                           type: object
 *                           nullable: true
 *                         businessSubCategory:
 *                           type: object
 *                           nullable: true
 *                         businessImages:
 *                           type: array
 *                         businessLogo:
 *                           type: string
 *                           nullable: true
 *                         postCode:
 *                           type: string
 *                           nullable: true
 *                         personName:
 *                           type: string
 *                           nullable: true
 *                         associatedWebsite:
 *                           type: string
 *                           nullable: true
 *                         openingHours:
 *                           type: array
 *                         notes:
 *                           type: string
 *                           nullable: true
 *                         businessType:
 *                           type: string
 *                           nullable: true
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid data or validation error
 *       403:
 *         description: Unauthorized, only admin can update business profiles
 *       404:
 *         description: Business profile not found
 */
router.put(
  "/update-business-profile/:id",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "businessLogo", maxCount: 1 },
    { name: "businessImages", maxCount: 5 },
  ]),
  validateToken,
  authorizeRoles("admin"),
  updateBusinessProfile
);

/**
 * @swagger
 * /api/admin/business-profiles:
 *   get:
 *     summary: Get business profiles with filters and related event details
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profileId
 *         schema:
 *           type: string
 *         description: Optional business profile ID for fetching a single profile.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for business name, email, or phone.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (ignored when profileId is provided).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size for pagination (ignored when profileId is provided).
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order for results.
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field used for sorting results.
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [bidPartner, businessPartner]
 *         description: Filter by business type.
 *       - in: query
 *         name: businessSubCategoryId
 *         schema:
 *           type: string
 *         description: Filter by business subcategory ID.
 *       - in: query
 *         name: businessCategoryId
 *         schema:
 *           type: string
 *         description: Filter by parent business category ID.
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city (case-insensitive).
 *       - in: query
 *         name: fundingStatus
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by bid partner funding status.
 *       - in: query
 *         name: isPartnershipActive
 *         schema:
 *           type: boolean
 *         description: Filter by partnership active flag (bid partners).
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by account active status.
 *       - in: query
 *         name: isEmailVerified
 *         schema:
 *           type: boolean
 *         description: Filter by email verification status.
 *       - in: query
 *         name: isPhoneVerified
 *         schema:
 *           type: boolean
 *         description: Filter by phone verification status.
 *       - in: query
 *         name: isSubscribed
 *         schema:
 *           type: boolean
 *         description: Filter by subscription flag.
 *       - in: query
 *         name: isProfileComplete
 *         schema:
 *           type: boolean
 *         description: Filter by profile completion status.
 *       - in: query
 *         name: isProfileSetup
 *         schema:
 *           type: boolean
 *         description: Filter by profile setup status.
 *       - in: query
 *         name: hasBusinessImages
 *         schema:
 *           type: boolean
 *         description: Filter for business partners with/without gallery images.
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter businesses created on or after this date.
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter businesses created on or before this date.
 *       - in: query
 *         name: eventDateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter related events with startDate on or after this date.
 *       - in: query
 *         name: eventDateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter related events with startDate on or before this date.
 *       - in: query
 *         name: eventStatus
 *         schema:
 *           type: string
 *           enum: [draft, published, canceled, completed]
 *         description: Filter related events by status.
 *       - in: query
 *         name: eventVisibility
 *         schema:
 *           type: string
 *           enum: [public, private]
 *         description: Filter related events by visibility.
 *       - in: query
 *         name: minEvents
 *         schema:
 *           type: integer
 *         description: Filter businesses with at least this number of related events.
 *       - in: query
 *         name: maxEvents
 *         schema:
 *           type: integer
 *         description: Filter businesses with at most this number of related events.
 *     responses:
 *       200:
 *         description: Business profiles retrieved successfully.
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
 *                   example: "Business profiles fetched successfully."
 *                 data:
 *                   description: Array of business profiles or a single profile when profileId is provided.
 *                 pagination:
 *                   type: object
 *                   nullable: true
 *                   description: Pagination metadata (absent when profileId is provided).
 *                 filtersApplied:
 *                   type: object
 *       403:
 *         description: Unauthorized, only admin can access this resource.
 */
router.get(
  "/business-profiles",
  validateToken,
  authorizeRoles("admin"),
  getBusinessProfiles
);

/**
 * @swagger
 * /api/admin/business-names:
 *   get:
 *     summary: Get business names and IDs only (simplified list)
 *     description: Returns a simplified list of businesses with only ID and name, with pagination and basic filters.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search businesses by name (case-insensitive)
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [bidPartner, businessPartner]
 *         description: Filter by business type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by account active status
 *     responses:
 *       200:
 *         description: Business names fetched successfully
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
 *                   example: "Business names fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60e6c0b0c1302b3a2b5e7e1c"
 *                       name:
 *                         type: string
 *                         example: "Business Name"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       403:
 *         description: Unauthorized, only admin can access this resource
 *       400:
 *         description: Invalid filter parameters
 */
router.get(
  "/business-names",
  validateToken,
  authorizeRoles("admin"),
  getBusinessNames
);

/**
 * @swagger
 * /api/admin/bid-names:
 *   get:
 *     summary: Get BID names and IDs only (simplified list)
 *     description: Returns a paginated list of all BID (bidPartner) names and IDs. Supports search and active status filtering.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search BIDs by name (case-insensitive)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by account active status
 *     responses:
 *       200:
 *         description: BID names fetched successfully
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
 *                   example: "BID names fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60e6c0b0c1302b3a2b5e7e1c"
 *                       name:
 *                         type: string
 *                         example: "BID Name"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       403:
 *         description: Unauthorized, only admin can access this resource
 *       400:
 *         description: Invalid filter parameters
 */
router.get(
  "/bid-names",
  validateToken,
  authorizeRoles("admin"),
  getBidNames
);

/**
 * @swagger
 * /api/admin/business/categories:
 *   get:
 *     summary: Admin gets list of business categories (id and name only)
 *     description: Returns a simple list of all active business categories with only id and name.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of business categories
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
 *                       _id:
 *                         type: string
 *                         example: "6923f51e778655b4f7965845"
 *                       name:
 *                         type: string
 *                         example: "Food"
 *       403:
 *         description: Unauthorized, only admin can access this resource
 */
router.get(
  "/business/categories",
  validateToken,
  authorizeRoles("admin"),
  getCategoriesSimple
);

/**
 * @swagger
 * /api/admin/business/categories:
 *   post:
 *     summary: Admin creates a new business category
 *     description: Only authenticated admins can create categories via this route.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Food
 *               description:
 *                 type: string
 *                 example: All food related businesses
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Business category created
 */
router.post(
  "/business/categories",
  validateToken,
  authorizeRoles("admin"),
  createBusinessCategory
);

/**
 * @swagger
 * /api/admin/business/categories/{categoryId}:
 *   put:
 *     summary: Admin updates a business category
 *     description: Requires admin role; used for editing category metadata.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Food
 *               description:
 *                 type: string
 *                 example: Updated description of food businesses
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Business category updated
 */
router.put(
  "/business/categories/:categoryId",
  validateToken,
  authorizeRoles("admin"),
  updateBusinessCategory
);

/**
 * @swagger
 * /api/admin/business/categories/{categoryId}:
 *   delete:
 *     summary: Admin deletes a business category
 *     description: Restricted to admins; removes the category and related references.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Business category deleted
 */
router.delete(
  "/business/categories/:categoryId",
  validateToken,
  authorizeRoles("admin"),
  deleteBusinessCategory
);

/**
 * @swagger
 * /api/admin/business/subcategories:
 *   post:
 *     summary: Admin creates a new business subcategory
 *     description: Only admins can add subcategories that belong to an existing category.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, categoryId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Restaurants
 *               description:
 *                 type: string
 *                 example: Places to eat
 *               categoryId:
 *                 type: string
 *                 example: 64f1a2b9c1234abcd56789ef
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Business subcategory created
 */
router.post(
  "/business/subcategories",
  validateToken,
  authorizeRoles("admin"),
  createBusinessSubCategory
);

/**
 * @swagger
 * /api/admin/business/subcategories/{subCategoryId}:
 *   put:
 *     summary: Admin updates a business subcategory
 *     description: Admin-only route used to edit subcategory data.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Restaurant
 *               description:
 *                 type: string
 *                 example: Updated description for restaurants
 *               categoryId:
 *                 type: string
 *                 example: 64f1a2b9c1234abcd56789ef
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Business subcategory updated
 */
router.put(
  "/business/subcategories/:subCategoryId",
  validateToken,
  authorizeRoles("admin"),
  updateBusinessSubCategory
);

/**
 * @swagger
 * /api/admin/business/subcategories/{subCategoryId}:
 *   delete:
 *     summary: Admin deletes a business subcategory
 *     description: Admin-only route to remove a subcategory.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Business subcategory deleted
 */
router.delete(
  "/business/subcategories/:subCategoryId",
  validateToken,
  authorizeRoles("admin"),
  deleteBusinessSubCategory
);

/**
 * @swagger
 * /api/admin/businesses/{id}/partnership-status:
 *   patch:
 *     summary: Activate or deactivate a bidPartner's partnership status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business (bidPartner) user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Set true to activate, false to deactivate partnership
 *               partnershipStartDate:
 *                 type: string
 *                 format: date-time
 *                 description: Optional ISO date to set partnership start date when activating
 *     responses:
 *       200:
 *         description: Partnership status updated successfully
 *       400:
 *         description: Invalid request payload
 *       403:
 *         description: Unauthorized, admin only
 *       404:
 *         description: Business not found
 */
router.patch(
  "/businesses/:id/partnership-status",
  validateToken,
  authorizeRoles("admin"),
  togglePartnershipStatus
);

/**
 * @swagger
 * /api/admin/events/{eventId}:
 *   delete:
 *     summary: Admin delete event
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to delete
 *     responses:
 *       200:
 *         description: Event and related resources deleted successfully
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
 *                   example: "Event and related resources deleted successfully"
 *       400:
 *         description: Invalid event ID
 *       403:
 *         description: Unauthorized, only admins can delete events
 *       404:
 *         description: Event not found
 */
router.delete(
  "/events/:eventId",
  validateToken,
  authorizeRoles("admin"),
  deleteEventByAdmin
);

/**
 * @swagger
 * /api/admin/events/create-for-business:
 *   post:
 *     summary: Admin creates an event for a business or user profile
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - eventCategoryId
 *               - startDate
 *               - endDate
 *               - title
 *               - description
 *               - location
 *               - status
 *               - visibility
 *               - userId
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [normal, burst]
 *                 description: The type of the event (normal or burst).
 *               eventCategoryId:
 *                 type: string
 *                 description: The ID of the event category.
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date and time of the event.
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time of the event.
 *               title:
 *                 type: string
 *                 description: The title of the event.
 *               description:
 *                 type: string
 *                 description: A detailed description of the event.
 *               location:
 *                 type: string
 *                 description: The location where the event will take place.
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the event location (optional).
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the event location (optional).
 *               status:
 *                 type: string
 *                 enum: [draft, published, canceled, completed]
 *                 description: The status of the event. Defaults to 'draft' if not provided.
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 description: The visibility of the event. Defaults to 'private' if not specified.
 *               attendees:
 *                 type: string
 *                 description: A comma-separated list of user IDs invited to the event.
 *                 example: "userID1,userID2,userID3"
 *               userId:
 *                 type: string
 *                 description: The ID of the user or business profile for whom the event is being created.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file associated with the event (optional).
 *     responses:
 *       201:
 *         description: Event created successfully
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
 *                     eventId:
 *                       type: string
 *                       description: The ID of the event.
 *                     title:
 *                       type: string
 *                       description: The title of the event.
 *                     description:
 *                       type: string
 *                       description: The description of the event.
 *                     imagePath:
 *                       type: string
 *                       description: The URL/path of the event image (if uploaded).
 *       400:
 *         description: Missing required fields or invalid input
 *       403:
 *         description: User is not allowed to create a public event (if `userType` is 'user')
 *       500:
 *         description: Internal server error
 */
router.post(
  "/events/create-for-business",
  validateToken,
  authorizeRoles("admin"), // Only admins should have access to this route
  upload.single("image"), // Handle image file upload with field name "image"
  createEventForBusiness
);

/**
 * @swagger
 * /api/admin/events/update-for-business/{eventId}:
 *   put:
 *     summary: Admin updates an event for a business or user profile
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [normal, burst]
 *                 description: The type of the event (normal or burst).
 *               eventCategoryId:
 *                 type: string
 *                 description: The ID of the event category.
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: The start date and time of the event.
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: The end date and time of the event.
 *               title:
 *                 type: string
 *                 description: The title of the event.
 *               description:
 *                 type: string
 *                 description: A detailed description of the event.
 *               location:
 *                 type: string
 *                 description: The location where the event will take place.
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the event location (optional).
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the event location (optional).
 *               status:
 *                 type: string
 *                 enum: [draft, published, canceled, completed]
 *                 description: The status of the event.
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 description: The visibility of the event. Must be 'private' if userId is a user type.
 *               attendees:
 *                 type: string
 *                 description: A comma-separated list of user IDs to add to the event (adds to existing, doesn't remove).
 *                 example: "userID1,userID2,userID3"
 *               userId:
 *                 type: string
 *                 description: Optional - The ID of the user or business profile to transfer event ownership to.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file associated with the event (optional, replaces existing if provided).
 *     responses:
 *       200:
 *         description: Event updated successfully
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
 *                     _id:
 *                       type: string
 *                       description: The ID of the event.
 *                     title:
 *                       type: string
 *                       description: The title of the event.
 *                     description:
 *                       type: string
 *                       description: The description of the event.
 *                     imagePath:
 *                       type: string
 *                       description: The URL/path of the event image (if uploaded).
 *                     createdBy:
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
 *                     group:
 *                       type: object
 *                       nullable: true
 *       400:
 *         description: Missing required fields or invalid input
 *       403:
 *         description: User is not allowed to have a public event (if `userType` is 'user')
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/events/update-for-business/:eventId",
  validateToken,
  authorizeRoles("admin"), // Only admins should have access to this route
  upload.single("image"), // Handle image file upload with field name "image"
  updateEventForBusiness
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     description: Returns detailed information about a specific user including first name, last name, Instagram, X/Twitter links, contact details (phone, email), and profile information. Password is excluded from the response.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details fetched successfully
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
 *                   example: "User details fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60e6c0b0c1302b3a2b5e7e1c"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     password:
 *                       type: string
 *                       example: "$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 *                     instagram:
 *                       type: string
 *                       example: "https://instagram.com/johndoe"
 *                     twitter:
 *                       type: string
 *                       example: "https://twitter.com/johndoe"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     profileImage:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *                     userType:
 *                       type: string
 *                       enum: [user, business, admin]
 *                       example: "user"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid user ID
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: User not found
 */
router.get("/users/:id", validateToken, authorizeRoles("admin"), getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID (admin)
 *     description: Permanently removes a user account along with associated data where applicable.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
  "/users/:id",
  validateToken,
  authorizeRoles("admin"),
  deleteUserByAdmin
);

/**
 * @swagger
 * /api/admin/users/{id}/password:
 *   patch:
 *     summary: Update user password (admin)
 *     description: Allows admins to set a new password for a user. Password must be at least 8 characters.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "NewSecurePass123"
 *                 description: New password (minimum 8 characters)
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid user ID or password
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: User not found
 */
router.patch(
  "/users/:id/password",
  validateToken,
  authorizeRoles("admin"),
  updateUserPasswordByAdmin
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get filtered list of users only 
 *     description: >
 *       Returns only users (userType="user") with filters: allUsers, newUsers, active, blocked.
 *       Supports search, sorting, and pagination.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, example: "createdAt" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *       - in: query
 *         name: search
 *         description: Global search over name, email, phone
 *         schema: { type: string, example: "john" }
 *       - in: query
 *         name: filter
 *         description: Filter type for users
 *         schema: { type: string, enum: [allUsers, newUsers, active, blocked], example: "allUsers" }
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/users", validateToken, authorizeRoles("admin"), getUsersFilter);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate (block/unblock) a user
 *     description: >
 *       Admin can toggle a user's `isActive` status. This API only targets users with `userType="user"`.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: The user ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "User has been deactivated successfully." }
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: User not found or not a regular user
 */
router.patch(
  "/users/:id/status",
  validateToken,
  authorizeRoles("admin"),
  updateUserStatus
);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get paginated list of reports with related user details
 *     description: Returns reports with issue, image, status, created/updated dates, and related users (reported user, raisedBy, approvedBy). Supports search, filters, sorting, and pagination.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, example: "createdAt" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *       - in: query
 *         name: q
 *         description: Global search over issue and user names/emails
 *         schema: { type: string, example: "payment" }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, resolved, closed], example: "pending" }
 *       - in: query
 *         name: userId
 *         description: Filter by the reported userId
 *         schema: { type: string }
 *       - in: query
 *         name: raisedBy
 *         description: Filter by who raised the report
 *         schema: { type: string }
 *       - in: query
 *         name: approved
 *         description: approved=true -> approvedBy not null, approved=false -> approvedBy null
 *         schema: { type: boolean, example: false }
 *       - in: query
 *         name: dateFrom
 *         description: ISO date (inclusive) - filter created on/after this date
 *         schema: { type: string, format: date-time, example: "2025-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         description: ISO date (inclusive) - filter created on/before this date
 *         schema: { type: string, format: date-time, example: "2025-12-31T23:59:59.999Z" }
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/reports", validateToken, authorizeRoles("admin"), getReports);

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report fetched successfully
 *       404:
 *         description: Report not found
 */
router.get(
  "/reports/:id",
  validateToken,
  authorizeRoles("admin"),
  getReportById
);

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   put:
 *     summary: Update report status or approval
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, resolved, closed]
 *                 example: resolved
 *               approvedBy:
 *                 type: string
 *                 example: "userId"
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       400:
 *         description: Missing status or approval info
 *       404:
 *         description: Report not found
 */
router.put(
  "/reports/:id",
  validateToken,
  authorizeRoles("admin"),
  updateReport
);

/**
 * @swagger
 * /api/admin/reports/{id}:
 *   delete:
 *     summary: Delete a report by ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: The report ID.
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       400:
 *         description: Invalid report id
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Report not found
 */
router.delete(
  "/reports/:id",
  validateToken,
  authorizeRoles("admin"),
  deleteReport
);

/**
 * @swagger
 * /api/admin/home:
 *   get:
 *     summary: Admin home dashboard with stats and recently joined users
 *     description: >
 *       Returns overall stats for users, businesses, bidPartners/businessPartners along with hike % compared to yesterday,
 *       and a paginated list of recently joined users (both `user` and `business`).
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, example: "createdAt" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *       - in: query
 *         name: q
 *         description: Global search over name, email, phone
 *         schema: { type: string, example: "john" }
 *       - in: query
 *         name: userType
 *         schema: { type: string, enum: [allUsers, user, business], example: "allUsers" }
 *       - in: query
 *         name: businessType
 *         schema: { type: string, enum: [bidPartner, businessPartner], example: "bidPartner" }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean, example: true }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time, example: "2025-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time, example: "2025-12-31T23:59:59.999Z" }
 *     responses:
 *       200:
 *         description: Admin dashboard data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totals:
 *                       type: object
 *                       properties:
 *                         allUser: { type: integer, example: 1200 }
 *                         allPartnerBid: { type: integer, example: 300 }
 *                         allBusiness: { type: integer, example: 500 }
 *                     hikes:
 *                       type: object
 *                       properties:
 *                         userHike: { type: number, example: 12.5 }
 *                         partnerBidHike: { type: number, example: -4.3 }
 *                         businessHike: { type: number, example: 0 }
 *                     recentlyJoined:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id: { type: string, example: "60e6c0b0c1302b3a2b5e7e1c" }
 *                           name: { type: string, example: "John Doe" }
 *                           email: { type: string, example: "john@example.com" }
 *                           phone: { type: string, example: "1234567890" }
 *                           userType: { type: string, enum: [user, business], example: "business" }
 *                           businessType: { type: string, enum: [bidPartner, businessPartner], example: "bidPartner" }
 *                           createdAt: { type: string, format: date-time }
 *                           profileImage: { type: string, example: "https://example.com/image.jpg" }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer, example: 1 }
 *                         limit: { type: integer, example: 10 }
 *                         total: { type: integer, example: 120 }
 *                         totalPages: { type: integer, example: 12 }
 *                         hasNextPage: { type: boolean, example: true }
 *                         hasPrevPage: { type: boolean, example: false }
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/home", validateToken, authorizeRoles("admin"), getAdminHome);

/**
 * @swagger
 * /api/admin/all-users:
 *   get:
 *     summary: Get paginated list of all users (all userTypes)
 *     description: >
 *       Returns all users including `user`, `business`, and `admin`.
 *       Supports search (q), filters, sorting, and pagination.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, example: "createdAt" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *       - in: query
 *         name: q
 *         description: Global search over name, email, phone
 *         schema: { type: string, example: "john" }
 *       - in: query
 *         name: userType
 *         schema: { type: string, enum: [allUsers, user, business, admin], example: "allUsers" }
 *       - in: query
 *         name: businessType
 *         schema: { type: string, enum: [bidPartner, businessPartner], example: "bidPartner" }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean, example: true }
 *       - in: query
 *         name: isPhoneVerified
 *         schema: { type: boolean, example: true }
 *       - in: query
 *         name: isSubscribed
 *         schema: { type: boolean, example: false }
 *       - in: query
 *         name: hasProfileImage
 *         schema: { type: boolean, example: true }
 *       - in: query
 *         name: authProvider
 *         schema: { type: string, enum: [email, google, apple], example: "email" }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time, example: "2025-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time, example: "2025-12-31T23:59:59.999Z" }
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/all-users", validateToken, authorizeRoles("admin"), getAllUsers);


/**
 * @swagger
 * /api/admin/events:
 *   get:
 *     summary: Get all events with owner details
 *     description: >
 *       Returns paginated list of all events with owner (creator) details including phone, email, and following count.
 *       Each event includes an eventStatus field indicating if it's "live", "upcoming", or "finished".
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventStatusFilter
 *         schema:
 *           type: string
 *           enum: [allEvents, live, upcomingEvents, finished]
 *           default: allEvents
 *         description: Filter events by their time status. allEvents (default) returns all, live returns currently ongoing events, upcomingEvents returns future events, finished returns past events.
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, example: "createdAt" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *       - in: query
 *         name: q
 *         description: Search in event title, description, location
 *         schema: { type: string, example: "music" }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, canceled, completed], example: "published" }
 *       - in: query
 *         name: visibility
 *         schema: { type: string, enum: [public, private], example: "public" }
 *       - in: query
 *         name: burst
 *         description: Filter burst events (yes = burst only, no = exclude burst)
 *         schema: { type: string, enum: [yes, no], example: "yes" }
 *       - in: query
 *         name: userId
 *         description: Filter events by owner userId
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         description: Filter events created on/after this date
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         description: Filter events created on/before this date
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: businessType
 *         description: Filter events by creator's business type
 *         schema: { type: string, enum: [bidPartner, businessPartner], example: "businessPartner" }
 *     responses:
 *       200:
 *         description: Events fetched successfully
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/events", validateToken, authorizeRoles("admin"), getAllEvents);

/**
 * @swagger
 * /api/admin/events/{eventId}:
 *   get:
 *     summary: Get event by ID (admin)
 *     description: Returns event details with owner contact info and attendees list.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID to fetch
 *     responses:
 *       200:
 *         description: Event fetched successfully
 *       400:
 *         description: Invalid event ID
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Event not found
 */
router.get(
  "/events/:eventId",
  validateToken,
  authorizeRoles("admin"),
  getEventByIdForAdmin
);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get admin analytics dashboard data
 *     description: >
 *       Returns comprehensive analytics including total events, active BIDs, total traffic,
 *       engagement rate with hike percentages compared to last month, and recent events list with filters.
 *       When businessId is provided, all metrics are filtered to events created by that specific business user.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *         description: Page number for recent events pagination
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *         description: Number of recent events per page
 *       - in: query
 *         name: dateFrom
 *         description: Filter recent events created on/after this date (ISO date)
 *         schema: { type: string, format: date-time, example: "2025-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         description: Filter recent events created on/before this date (ISO date)
 *         schema: { type: string, format: date-time, example: "2025-12-31T23:59:59.000Z" }
 *       - in: query
 *         name: businessType
 *         description: Filter recent events by owner's businessType (bidPartner or businessPartner)
 *         schema: { type: string, enum: [bidPartner, businessPartner], example: "businessPartner" }
 *       - in: query
 *         name: eventCategory
 *         description: Filter recent events by event category ID
 *         schema: { type: string, example: "6891d7f74754f3e67e89fff9" }
 *       - in: query
 *         name: businessId
 *         description: Filter analytics by specific business user ID (filters all metrics to events created by this business)
 *         schema: { type: string, example: "6891d7f74754f3e67e89fff9" }
 *       - in: query
 *         name: BidId
 *         description: Alternative parameter name for businessId - Filter analytics by specific business user ID (filters all metrics to events created by this business)
 *         schema: { type: string, example: "6891d7f74754f3e67e89fff9" }
 *       - in: query
 *         name: cityId
 *         description: Filter analytics by city name (filters all metrics to events in this city - matches location field)
 *         schema: { type: string, example: "Lahore" }
 *     responses:
 *       200:
 *         description: Analytics data fetched successfully
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
 *                   example: "Analytics data fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEvents:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 150
 *                         hikePercent:
 *                           type: number
 *                           example: 12.5
 *                           description: Percentage change from last month (can be negative)
 *                     activeBIDs:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 45
 *                         hikePercent:
 *                           type: number
 *                           example: -5.2
 *                           description: Percentage change from last month (can be negative)
 *                     totalTraffic:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                           example: "85.2K"
 *                           description: Formatted traffic value (sum of all event clicks)
 *                         hikePercent:
 *                           type: number
 *                           example: 8.3
 *                           description: Percentage change from last month (can be negative)
 *                     engagementRate:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           example: 65.5
 *                           description: Engagement rate percentage
 *                         hikePercent:
 *                           type: number
 *                           example: 3.2
 *                           description: Percentage change from last month (can be negative)
 *                     totalAttendees:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 1000
 *                           description: Total number of attendees across all events
 *                         hikePercent:
 *                           type: number
 *                           example: 15.2
 *                           description: Percentage change from last month (can be negative)
 *                     recentEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           eventId:
 *                             type: string
 *                             nullable: true
 *                             example: "6920aa4bc2721512cc7700aa"
 *                             description: The ID of the event
 *                           eventName:
 *                             type: string
 *                             example: "Music event in lahore"
 *                           owner:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 nullable: true
 *                                 example: "6891d7f74754f3e67e89fff9"
 *                                 description: The ID of the owner (business/user)
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                               businessType:
 *                                 type: string
 *                                 enum: [bidPartner, businessPartner]
 *                                 nullable: true
 *                                 example: "businessPartner"
 *                           createdDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-09-10T07:28:16.234Z"
 *                           status:
 *                             type: string
 *                             enum: [draft, published, canceled, completed]
 *                             example: "published"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/analytics", validateToken, authorizeRoles("admin"), getAdminAnalytics);

/**
 * @swagger
 * /api/admin/cities:
 *   get:
 *     summary: Get all cities from events
 *     description: Returns an array of all unique cities extracted from event locations. Can be filtered by date range and business type.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         description: Filter events created on/after this date (ISO date)
 *         schema: { type: string, format: date-time, example: "2025-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         description: Filter events created on/before this date (ISO date)
 *         schema: { type: string, format: date-time, example: "2025-12-31T23:59:59.000Z" }
 *       - in: query
 *         name: businessType
 *         description: Filter events by owner's businessType (bidPartner or businessPartner)
 *         schema: { type: string, enum: [bidPartner, businessPartner], example: "businessPartner" }
 *     responses:
 *       200:
 *         description: Cities fetched successfully
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
 *                   example: "Cities fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Karachi", "Lahore", "Islamabad"]
 *                       description: Array of all unique cities from events (sorted alphabetically)
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/cities", validateToken, authorizeRoles("admin"), getAdminCities);

module.exports = router;
