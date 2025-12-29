const express = require("express");
const { reportIssue } = require("../controllers/report_Controller");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Ensure memory storage is used

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Report an issue (authenticated)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - issueDescription
 *             properties:
 *               issueDescription:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image attachment
 *     responses:
 *       201:
 *         description: Issue reported successfully
 *       400:
 *         description: Missing issue description
 *       500:
 *         description: Image upload failed
 */
router.post(
  "/",
  upload.single("image"),
  reportIssue
);

module.exports = router;
