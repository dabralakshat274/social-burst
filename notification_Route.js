const express = require("express");
const {
  sendAndSaveNotification,
  sendNotificationOnly,
  getAllNotifications,
  getNotificationsForUser,
  updateNotificationStatus,
  deleteNotification,
} = require("../controllers/notification_Controller");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");

/**
 * @swagger
 * components:
 *   schemas:
 *     UserShort:
 *       type: object
 *       description: "Minimal user info when populated in notifications"
 *       properties:
 *         _id:
 *           type: string
 *           example: "671c90bfe51214bba935bd81"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *
 *     Notification:
 *       type: object
 *       description: "Notification document"
 *       properties:
 *         _id:
 *           type: string
 *           example: "671d2b54b1a9e34a8f2bdf4c"
 *         title:
 *           type: string
 *           example: "Order Update"
 *         body:
 *           type: string
 *           description: "Notification body text"
 *           example: "Your order #1234 has been shipped."
 *         message:
 *           type: string
 *           description: "Alternative field name if message is used instead of body"
 *           example: "Your order has been shipped"
 *         users:
 *           type: array
 *           description: "User references or populated user objects"
 *           items:
 *             oneOf:
 *               - type: string
 *                 example: "671c90bfe51214bba935bd81"
 *               - $ref: "#/components/schemas/UserShort"
 *         read:
 *           type: boolean
 *           example: false
 *         isAdminMessage:
 *           type: boolean
 *           example: false
 *         type:
 *           type: string
 *           example: "Chat"
 *         meta:
 *           type: object
 *           description: "Optional metadata for context"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-10T11:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-15T09:45:12.000Z"
 *       required:
 *         - title
 *         - body
 */

/**
 * @swagger
 * /api/notifications/sendNotification:
 *   post:
 *     summary: "Send a notification "
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: "User ID of the recipient"
 *               token:
 *                 type: string
 *                 description: "Firebase device token for the user"
 *               title:
 *                 type: string
 *                 description: "Title of the notification"
 *               message:
 *                 type: string
 *                 description: "Body of the notification"
 *               isAdminMessage:
 *                 type: boolean
 *                 default: false
 *               type:
 *                 type: string
 *                 default: "Chat"
 *             required:
 *               - userId
 *               - token
 *               - title
 *               - message
 *     responses:
 *       200:
 *         description: "Notification sent and saved successfully"
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
 *                   example: "Notification sent and saved successfully"
 *       500:
 *         description: "Error sending or saving the notification"
 */
router.post(
  "/sendNotification",
  validateToken,
  authorizeRoles("admin"),
  sendNotificationOnly
);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: "Send a push notification and save it to the database"
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: "Optional user ID for reference or token lookup"
 *               token:
 *                 type: string
 *                 description: "Optional device FCM token (if not provided, userId will be used to look up)"
 *               title:
 *                 type: string
 *                 description: "Notification title"
 *               message:
 *                 type: string
 *                 description: "Notification body text"
 *               isAdminMessage:
 *                 type: boolean
 *                 example: false
 *               type:
 *                 type: string
 *                 example: "Chat"
 *               userType:
 *                 type: string
 *                 enum: [businessPartner, bidPartner]
 *                 description: "Filter by business type. If provided, notification will be sent to all users with this businessType. Cannot be used with userId."
 *                 example: "businessPartner"
 *               sendOutDate:
 *                 type: string
 *                 format: date-time
 *                 description: "Schedule notification for a future date (ISO 8601 format). If not provided or in the past, notification is sent immediately."
 *                 example: "2025-12-25T10:00:00.000Z"
 *             required:
 *               - title
 *               - message
 *     responses:
 *       200:
 *         description: "Notification saved and push attempted"
 *       400:
 *         description: "Bad request"
 *       401:
 *         description: "Unauthorized"
 *       403:
 *         description: "Forbidden"
 *       500:
 *         description: "Server error"
 */
router.post(
  "/send",
  validateToken,
  authorizeRoles("admin"),
  sendAndSaveNotification
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: "Get all notifications with pagination, search, and sorting"
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Search notifications by title or message"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Page number"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: "Number of items per page"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: "Sort order direction"
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: "Field to sort by"
 *     responses:
 *       200:
 *         description: "List of notifications"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       500:
 *         description: "Server error"
 */
// router.get("/", getAllNotifications);

/**
 * @swagger
 * /api/notifications/user:
 *   get:
 *     summary: "Get all notifications for the logged-in user (with pagination, search, sorting) and mark returned items as read"
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Search notifications by title or message"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Page number"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: "Number of items per page"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: "Sort order direction"
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: "Field to sort by"
 *     responses:
 *       200:
 *         description: "Notifications fetched and marked read"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                 data:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: "Server error"
 */
router.get(
  "/user",
  validateToken,
  authorizeRoles("user", "admin"),
  getNotificationsForUser
);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: "Update the status of a notification (mark as read/unread)"
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Notification ID to update"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               read:
 *                 type: boolean
 *                 example: true
 *                 description: "Mark notification as read or unread"
 *     responses:
 *       200:
 *         description: "Notification status updated"
 *       404:
 *         description: "Notification not found"
 *       500:
 *         description: "Server error"
 */
router.put(
  "/:notificationId/read",
  validateToken,
  authorizeRoles("user", "admin"),
  updateNotificationStatus
);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: "Delete a notification"
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Notification ID to delete"
 *     responses:
 *       200:
 *         description: "Notification deleted successfully"
 *       404:
 *         description: "Notification not found"
 *       500:
 *         description: "Server error"
 */
router.delete(
  "/:notificationId",
  validateToken,
  authorizeRoles("user", "admin"),
  deleteNotification
);

module.exports = router;
