const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Creates a new Stripe customer if the user does not already have a Stripe customer ID.
const createCustomerIfNotExists = async (user, paymentMethodId) => {
  if (!user.stripe_customer_id) {

    const customer = await stripe.customers.create({
      email: user.email,
    });

    return customer.id;
  }
  return user.stripe_customer_id;
};

// Attaches a payment method to an existing Stripe customer and updates their default.
const attachPaymentMethod = async (customerId, paymentMethodId) => {
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
};

// Creates a new subscription for a customer with the specified price and payment type.
const createStripeSubscription = async (customerId, priceId, paymentType) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    expand: ["latest_invoice.payment_intent"],
    payment_settings: {
      payment_method_types: paymentType === "paypal" ? [paymentType] : ["card"],
    },
    payment_behavior: "default_incomplete",
  });
};

module.exports = {
  createCustomerIfNotExists,
  attachPaymentMethod,
  createStripeSubscription,
};
