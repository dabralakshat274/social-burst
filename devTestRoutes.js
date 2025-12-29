const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const createError = require("../utils/createError");
const { constants } = require("../constants");

/**
 * @swagger
 * /api/dev/create-test-payment-method:
 *   get:
 *     summary: Create a Stripe test payment method
 *     tags: [Dev Tools]
 *     responses:
 *       200:
 *         description: Returns a test payment method ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Test payment method created
 *                 paymentMethodId:
 *                   type: string
 *                   example: pm_1XYZabc123
 *       500:
 *         description: Server error
 */
router.get("/create-test-payment-method", async (req, res, next) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: "tok_visa",
      },
    });

    return res.status(constants.SUCCESS).json({
      success: true,
      message: "Test payment method created",
      paymentMethodId: paymentMethod.id,
    });
  } catch (err) {
    return next(
      createError(
        constants.VALIDATION_ERROR,
        "Failed to create test payment method: " + err.message
      )
    );
  }
});

module.exports = router;
