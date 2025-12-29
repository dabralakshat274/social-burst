
// const cron = require("node-cron");
// const Subscription = require("../models/subscriptionModel");

// const checkAndExpireSubscriptions = async () => {
//   try {
//     const now = new Date();
//     const subscriptions = await Subscription.find({
//       endDate: { $lt: now },
//       status: { $ne: "expired" }
//     });

//     for (let sub of subscriptions) {
//       sub.status = "expired";
//       await sub.save();
//     }
//      console.log(`[CRON]  ${subscriptions.length} subscriptions marked as expired at ${now.toISOString()}`);
//   } catch (err) {
//     console.error("[CRON ERROR]  Failed to check expired subscriptions:", err.message);
//   }
// };

// // Schedule job to run daily at midnight
// cron.schedule("0 0 * * *", checkAndExpireSubscriptions);
// module.exports = checkAndExpireSubscriptions;