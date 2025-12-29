// routes/eventCategoryRoutes.js
const express = require("express");
const {
  createEventCategory,
  getEventCategories,
  updateEventCategory,
  deleteEventCategory,
} = require("../controllers/eventCategory_Controller");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Event Categories
 *   description: API for CRUD operations on event categories
 */

/**
 * @swagger
 * /api/event-categories:
 *   post:
 *     summary: Create a new event category
 *     tags: [Event Categories]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: karaoke
 *               description:
 *                 type: string
 *                 example: Fun karaoke nights with friends
 *               imagePath:
 *                 type: string
 *                 format: binary
 *                 description: Event category image (optional)
 *     responses:
 *       201:
 *         description: Event category created successfully
 *       400:
 *         description: Error in category creation
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  validateToken,
  authorizeRoles("admin"),
  upload.single("imagePath"),
  createEventCategory
);
// router.post("/", upload.single("imagePath"), createEventCategory);

/**
 * @swagger
 * /api/event-categories:
 *   get:
 *     summary: Get all event categories
 *     tags: [Event Categories]
 *     responses:
 *       200:
 *         description: List of event categories
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  validateToken,
  authorizeRoles("user", "admin"),
  getEventCategories
);

/**
 * @swagger
 * /api/event-categories/{categoryId}:
 *   put:
 *     summary: Update an event category
 *     tags: [Event Categories]
 *     security:
 *       - BearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Event Category ID
 *         schema:
 *           type: string
 *           example: 60d7a7a8f3b74f0b8c3b98db
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: karaoke
 *               description:
 *                 type: string
 *                 example: New and updated description for karaoke
 *               imagePath:
 *                 type: string
 *                 format: binary
 *                 description: Event category image (optional, will update if provided)
 *     responses:
 *       200:
 *         description: Event category updated successfully
 *       400:
 *         description: Error in updating event category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:categoryId",
  validateToken,
  authorizeRoles("admin"),
  upload.single("imagePath"),
  updateEventCategory
);
// router.put("/:categoryId", updateEventCategory);

/**
 * @swagger
 * /api/event-categories/{categoryId}:
 *   delete:
 *     summary: Delete an event category
 *     tags: [Event Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Event Category ID to be deleted
 *         schema:
 *           type: string
 *           example: 60d7a7a8f3b74f0b8c3b98db
 *     responses:
 *       200:
 *         description: Event category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
// router.delete("/:categoryId", validateToken, authorizeRoles("admin"), deleteEventCategory);
router.delete(
  "/:categoryId",
  validateToken,
  authorizeRoles("admin"),
  deleteEventCategory
);

module.exports = router;
