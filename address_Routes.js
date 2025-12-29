const express = require("express");
const {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require("../controllers/address_Controller");
const validateToken = require("../middleware/validateTokenHandler");
const authorizeRoles = require("../middleware/authRoles");
const router = express.Router();
/**
 * @swagger
 * /api/users/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label of the address (e.g., home, work)
 *               addressLine1:
 *                 type: string
 *                 description: First line of the address
 *               addressLine2:
 *                 type: string
 *                 description: Second line of the address (optional)
 *               city:
 *                 type: string
 *                 description: The city of the address
 *               state:
 *                 type: string
 *                 description: The state of the address
 *               zipCode:
 *                 type: string
 *                 description: The zip code of the address
 *               country:
 *                 type: string
 *                 description: The country of the address
 *               latitude:
 *                 type: number
 *                 description: Latitude of the address
 *               longitude:
 *                 type: number
 *                 description: Longitude of the address
 *               type:
 *                 type: string
 *                 description: The type of address (e.g., home, office, other)
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                       description: The ID of the address
 *                     label:
 *                       type: string
 *                     addressLine1:
 *                       type: string
 *                     addressLine2:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zipCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     location:
 *                       type: string
 *                       description: Human-readable location (e.g., "Tokyo, Japan")
 *                     locationGeo:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "Point"
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [139.692, 35.6895]
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     type:
 *                       type: string
 *                     user:
 *                       type: string
 */

router.post("/addresses", validateToken, authorizeRoles("user"), createAddress);

/**
 * @swagger
 * /api/users/addresses:
 *   get:
 *     summary: Get all addresses of a user
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all addresses for the user
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       label:
 *                         type: string
 *                       addressLine1:
 *                         type: string
 *                       addressLine2:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       location:
 *                         type: string
 *                       locationGeo:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "Point"
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                             example: [139.692, 35.6895]
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       type:
 *                         type: string
 *                       user:
 *                         type: string
 */
router.get("/addresses", validateToken, authorizeRoles("user"), getAddresses);

/**
 * @swagger
 * /api/users/addresses/{addressId}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: The ID of the address to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label of the address (e.g., home, work)
 *               addressLine1:
 *                 type: string
 *                 description: First line of the address
 *               addressLine2:
 *                 type: string
 *                 description: Second line of the address (optional)
 *               city:
 *                 type: string
 *                 description: The city of the address
 *               state:
 *                 type: string
 *                 description: The state of the address
 *               zipCode:
 *                 type: string
 *                 description: The zip code of the address
 *               country:
 *                 type: string
 *                 description: The country of the address
 *               latitude:
 *                 type: number
 *                 description: Latitude of the address
 *               longitude:
 *                 type: number
 *                 description: Longitude of the address
 *               type:
 *                 type: string
 *                 description: The type of address (e.g., home, office, other)
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */
router.put(
  "/addresses/:addressId",
  validateToken,
  authorizeRoles("user"),
  updateAddress
);

/**
 * @swagger
 * /api/users/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         description: The ID of the address to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete(
  "/addresses/:addressId",
  validateToken,
  authorizeRoles("user"),
  deleteAddress
);

module.exports = router;
