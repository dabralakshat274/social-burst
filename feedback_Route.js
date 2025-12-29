const express = require("express");
const {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getAppFeedbackStats,
} = require("../controllers/feedback_Controller");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: App-wide feedback & ratings
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         submittedBy:
 *           type: string
 *           description: User ID
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/feedbacks:
 *   post:
 *     summary: Create feedback for the application (one per user)
 *     tags: [Feedback]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Feedback created
 *       400:
 *         description: Missing fields or already submitted
 */
router.post("/", validateToken, authorizeRoles("user"), createFeedback);

/**
 * @swagger
 * /api/feedbacks/stats:
 *   get:
 *     summary: Get average rating and count for the app
 *     tags: [Feedback]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: App feedback stats
 */
router.get(
  "/stats",
  validateToken,
  authorizeRoles("user"),
  getAppFeedbackStats
);

/**
 * @swagger
 * /api/feedbacks:
 *   get:
 *     summary: List feedbacks (filters + pagination)
 *     tags: [Feedback]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *       - in: query
 *         name: minRating
 *         schema: { type: integer }
 *       - in: query
 *         name: maxRating
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, default: createdAt }
 *     responses:
 *       200:
 *         description: Feedback list
 */
router.get("/", validateToken, authorizeRoles("user", "admin"), getFeedbacks);

/**
 * @swagger
 * /api/feedbacks/{feedbackId}:
 *   get:
 *     summary: Get feedback by id
 *     tags: [Feedback]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Single feedback
 *       404:
 *         description: Feedback not found
 */
router.get(
  "/:feedbackId",
  validateToken,
  authorizeRoles("user", "admin"),
  getFeedbackById
);

/**
 * @swagger
 * /api/feedbacks/{feedbackId}:
 *   put:
 *     summary: Update feedback (owner only)
 *     tags: [Feedback]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Feedback updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Feedback not found
 */
router.put(
  "/:feedbackId",
  validateToken,
  authorizeRoles("admin"),
  updateFeedback
);

/**
 * @swagger
 * /api/feedbacks/{feedbackId}:
 *   delete:
 *     summary: Delete feedback (owner or admin)
 *     tags: [Feedback]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Feedback deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Feedback not found
 */
router.delete(
  "/:feedbackId",
  validateToken,
  authorizeRoles("admin"),
  deleteFeedback
);

module.exports = router;
