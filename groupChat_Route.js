const express = require("express");
const multer = require("multer");
const {
  createGroupChat,
  sendMessage,
  addMember,
  removeMember,
  getMessages,
  deleteGroupChat,
  markAsRead,
} = require("../controllers/groupChat_Controller");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const router = express.Router();

// Multer setup to handle file uploads (store in memory for quick upload to S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /api/events/{eventId}/group-chat:
 *   post:
 *     summary: Create a group chat for the event with optional additional members. The event creator will be included by default.
 *     tags: [Group Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The event ID to create the group chat for
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               additionalMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: A list of user IDs to add to the group chat as members
 *                 description: List of additional members to include in the group chat
 *     responses:
 *       201:
 *         description: Group chat created successfully. The creator and any additional members will be added.
 *       404:
 *         description: Event not found. This error is returned if the event ID does not exist.
 *       500:
 *         description: An error occurred while creating the group chat. This includes internal server errors.
 */
router.post(
  "/:eventId/group-chat",
  validateToken,
  authorizeRoles("business", "user"),
  createGroupChat
);

/**
 * @swagger
 * /api/events/{eventId}/group-chat/message:
 *   post:
 *     summary: Send a message in the group chat
 *     tags: [Group Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The event ID where the group chat exists
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to be sent in the group chat
 *               replyTo:
 *                 type: string
 *                 nullable: true
 *                 description: Optional ID of the message being replied to
 *               isSystem:
 *                 type: boolean
 *                 default: false
 *                 description: If true, marks the message as a system message
 *               systemMessage:
 *                 type: string
 *                 description: Optional text describing a system event (e.g., "Admin added Priya")
 *     responses:
 *       200:
 *         description: Message sent successfully
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
 *                     message:
 *                       type: string
 *                     replyTo:
 *                       type: string
 *                       nullable: true
 *                     isSystem:
 *                       type: boolean
 *                     systemMessage:
 *                       type: string
 *                     sentBy:
 *                       type: string
 *                     groupId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: You are not a member of the group chat
 *       404:
 *         description: Group chat not found
 */
router.post(
  "/:eventId/group-chat/message",
  validateToken,
  authorizeRoles("user"),
  sendMessage
);

/**
 * @swagger
 * /api/events/{eventId}/group-chat/message/read:
 *   put:
 *     summary: Mark messages as read in the group chat
 *     tags: [Group Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The event ID where the group chat exists
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of message IDs to mark as read (can also send a single string)
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *       403:
 *         description: You are not a member of the group chat
 *       404:
 *         description: Group chat not found
 */
router.put(
  "/:eventId/group-chat/message/read",
  validateToken,
  authorizeRoles("user"),
  markAsRead
);

/**
 * @swagger
 * /api/events/{eventId}/group-chat/{userId}:
 *   post:
 *     summary: Add a member to the group chat
 *     tags: [Group Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The event ID where the group chat exists
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID to add to the group chat
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: User is already a member
 *       404:
 *         description: Group chat not found
 */
router.post(
  "/:eventId/group-chat/:userId",
  validateToken,
  authorizeRoles("business", "user"),
  addMember
);

// Remove a member from the group chat
/**
 * @swagger
 * /api/events/{eventId}/group-chat/{userId}:
 *   delete:
 *     summary: Remove a member from the group chat
 *     tags: [Group Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The event ID where the group chat exists
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID to remove from the group chat
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: User is not a member of the group chat
 *       404:
 *         description: Group chat not found
 */
router.delete(
  "/:eventId/group-chat/:userId",
  validateToken,
  authorizeRoles("business", "user"),
  removeMember
);

/**
 * @swagger
 * /api/events/{eventId}/group-chat/messages:
 *   get:
 *     summary: Get all messages in the group chat
 *     tags: [Group Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The event ID to fetch messages from the group chat
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *       404:
 *         description: Group chat not found
 */
router.get(
  "/:eventId/group-chat/messages",
  validateToken,
  authorizeRoles("user"),
  getMessages
);

// /**
//  * @swagger
//  * /api/events/create:
//  *   post:
//  *     summary: Create a new event with optional image upload
//  *     tags: [Events]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               eventType:
//  *                 type: string
//  *                 enum: [normal, burst]
//  *                 description: The type of the event (normal or burst).
//  *               eventCategoryId:
//  *                 type: string
//  *                 description: The ID of the event category.
//  *               startDate:
//  *                 type: string
//  *                 format: date-time
//  *                 description: The start date and time of the event.
//  *               endDate:
//  *                 type: string
//  *                 format: date-time
//  *                 description: The end date and time of the event.
//  *               title:
//  *                 type: string
//  *                 description: The title of the event.
//  *               description:
//  *                 type: string
//  *                 description: A detailed description of the event.
//  *               location:
//  *                 type: string
//  *                 description: The location where the event will take place.
//  *               latitude:
//  *                 type: number
//  *                 format: float
//  *                 description: The latitude of the event location (optional).
//  *               longitude:
//  *                 type: number
//  *                 format: float
//  *                 description: The longitude of the event location (optional).
//  *               status:
//  *                 type: string
//  *                 enum: [draft, published, canceled, completed]
//  *                 description: The status of the event. Defaults to 'draft' if not provided.
//  *               attendees:
//  *                 type: string
//  *                 description: A comma-separated list of user IDs invited to the event.
//  *                 example: "userID1,userID2,userID3"
//  *               visibility:
//  *                 type: string
//  *                 enum: [public, private]
//  *                 default: private
//  *                 description: The visibility of the event. Defaults to 'private' if not specified.
//  *               image:
//  *                 type: string
//  *                 format: binary  # Specify that the image is a file (binary data)
//  *                 description: The image associated with the event (optional).
//  *     responses:
//  *       201:
//  *         description: Event created successfully
//  *       404:
//  *         description: Event not found
//  */
// router.post("/:eventId/group-chat", validateToken, authorizeRoles("business", "admin"), createGroupChat);

// Delete Group Chat by groupChatId and eventId
/**
 * @swagger
 * /api/events/{eventId}/group-chats/{groupChatId}:
 *   delete:
 *     summary: Delete the group chat
 *     tags: [Group Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The event ID to identify which group chat to delete
 *         schema:
 *           type: string
 *       - in: path
 *         name: groupChatId
 *         required: true
 *         description: The group chat ID to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group chat deleted successfully
 *       403:
 *         description: You do not have permission to delete this group chat
 *       404:
 *         description: Group chat not found
 */
router.delete(
  "/:eventId/group-chats/:groupChatId",
  validateToken,
  authorizeRoles("business", "admin", "user"),
  deleteGroupChat
);

module.exports = router;
