// routes/account_Close_Routes.js
const express = require("express");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const { closeAccount } = require("../controllers/account_Close_Controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Account lifecycle commands
 */

/**
 * @swagger
 * /api/account/close:
 *   post:
 *     summary: Close current account (optional feedback text + hard delete)
 *     description: Optionally records final feedback text, then permanently deletes the account and all related data in a single atomic operation.
 *     tags: [Account, Feedback]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Optional feedback text shown on the Delete Account screen
 *     responses:
 *       200:
 *         description: Account closed and data purged
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 */
router.post(
  "/close",
  validateToken,
  // authorizeRoles("user", "business", "admin"),
  authorizeRoles("user"),

  closeAccount
);

module.exports = router;
