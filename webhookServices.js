// const Stripe = require("stripe");
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
// const Subscription = require("../models/subscriptionModel");

// /**
//  * Handles Stripe webhook events and updates subscription status.
//  * @param {object} event - The Stripe webhook event object.
//  */


// const handleStripeEvent = async (event) => {
//   switch (event.type) {
//     case 'invoice.payment_succeeded':
//       const paymentSucceededInvoice = event.data.object;
//       const subscriptionId = paymentSucceededInvoice.subscription;
      
    
//       await Subscription.findOneAndUpdate(
//         { stripeSubscriptionId: subscriptionId },
//         { status: 'active' }
//       );
//       console.log(`Subscription ${subscriptionId} has been activated.`);
//       break;

//     case 'invoice.payment_failed':
//       const paymentFailedInvoice = event.data.object;
//       const failedSubscriptionId = paymentFailedInvoice.subscription;
      
      
//       await Subscription.findOneAndUpdate(
//         { stripeSubscriptionId: failedSubscriptionId },
//         { status: 'past_due' }
//       );
//       console.log(`Subscription ${failedSubscriptionId} payment failed.`);
//       break;

//     case 'customer.subscription.updated':
//       const updatedSubscription = event.data.object;
//       const subscriptionStatus = updatedSubscription.status;

//       // if subscription is canceled or expired, update the status
//       if (subscriptionStatus === 'canceled' || subscriptionStatus === 'expired') {
//         await Subscription.findOneAndUpdate(
//           { stripeSubscriptionId: updatedSubscription.id },
//           { status: subscriptionStatus, endDate: new Date() }
//         );
//         console.log(`Subscription ${updatedSubscription.id} status updated to ${subscriptionStatus}.`);
//       }
//       break;

//     case 'customer.subscription.deleted':
//       const deletedSubscription = event.data.object;
//       // Mark the subscription as "canceled" or "expired"
//       await Subscription.findOneAndUpdate(
//         { stripeSubscriptionId: deletedSubscription.id },
//         { status: 'canceled', endDate: new Date() }
//       );
//       console.log(`Subscription ${deletedSubscription.id} has been canceled.`);
//       break;

//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }
// };

// /**
//  * Webhook handler for Stripe events
//  * @param {object} req 
//  * @param {object} res 
//  */
// const handleWebhook = async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     await handleStripeEvent(event);

//     res.status(200).json({ received: true });
//   } catch (err) {
//     console.error(`Webhook Error: ${err.message}`);
//     res.status(400).send(`Webhook Error: ${err.message}`);
//   }
// };

// module.exports = {
//   handleWebhook,
// };