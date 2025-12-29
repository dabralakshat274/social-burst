// routes/businessCategoryRoutes.js
const express = require("express");
const {
  getBusinessCategories,
  getBusinessSubCategories,
} = require("../controllers/businessCategory_Controller");
const authorizeRoles = require("../middleware/authRoles");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Business Categories
 *   description: CRUD operations for business categories and subcategories
 */

/* ---------------------- CATEGORY ROUTES ---------------------- */

/**
 * @swagger
 * /api/business/categories:
 *   get:
 *     summary: Public list of business categories
 *     description: Any user can fetch paginated category listings; auth is optional.
 *     tags: [Business Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string, example: "food" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: desc }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, example: createdAt }
 *     responses:
 *       200:
 *         description: List of business categories
 */
router.get(
  "/categories",
  validateToken,
  getBusinessCategories
);

/* ---------------------- SUBCATEGORY ROUTES ---------------------- */
/**
 * @swagger
 * /api/business/subcategories:
 *   get:
 *     summary: Public list of business subcategories
 *     description: Accessible to any user for browsing available subcategories.
 *     tags: [Business Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string, example: "restaurant" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: asc }
 *       - in: query
 *         name: orderBy
 *         schema: { type: string, example: createdAt }
 *     responses:
 *       200:
 *         description: List of business subcategories
 */
router.get(
  "/subcategories",
  validateToken,
  getBusinessSubCategories
);

module.exports = router;
