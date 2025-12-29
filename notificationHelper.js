// services/notificationHelper.js
const admin = require("../config/firebase"); // <-- only import the single firebase file
const Notification = require("../models/notification_Model");
const User = require("../models/userModel"); // adjust path if needed

/**
 * Send a notification to a single user (uses user's fcmToken field).
 * - Saves Notification document
 * - Sends FCM message if token exists
 * - Removes token from DB if FCM returns not-registered / invalid errors
 *
 * @param {String} userId   - mongoose user _id
 * @param {String} token    - optional token override; if not provided, looks up user.fcmToken
 * @param {String} title
 * @param {String} message
 * @param {Boolean} isAdminMessage
 * @param {String} type
 */
const sendNotification = async ({
  userId,
  token,
  title,
  message,
  isAdminMessage = false,
  type,
  typeId,
  createdBy,
}) => {
  try {
    const recipientIds = Array.isArray(userId) ? userId : [userId];
    const results = [];

    for (const recipientId of recipientIds) {
      const notificationDoc = await Notification.create({
        users: recipientId,
        title: title || "System",
        typeId,
        body: message || "",
        isAdminMessage,
        type,
        createdBy,
      });

      let fcmToken = token;
      if (!fcmToken) {
        const user = await User.findById(recipientId).select("fcmToken");
        fcmToken = user && user.fcmToken;
      }

      if (!fcmToken) {
        results.push({
          userId: recipientId,
          notificationId: notificationDoc._id,
          sent: false,
          reason: "no-token",
        });
        continue;
      }

      const messagePayload = {
        token: fcmToken,
        notification: { title, body: message },
        data: {
          title,
          body: message,
          type: typeof type === "string" ? type : JSON.stringify(type),
        },
        android: { priority: "high" },
        apns: { headers: { "apns-priority": "10" } },
      };

      const sendResult = await admin.messaging().send(messagePayload);
      results.push({
        userId: recipientId,
        notificationId: notificationDoc._id,
        sent: true,
        messageId: sendResult,
      });
    }

    return results.length === 1 ? results[0] : results;
  } catch (err) {
    console.error("❌ Notification error:", err);

    if (err && err.errorInfo && err.errorInfo.code) {
      const code = err.errorInfo.code;
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
        try {
          await User.findByIdAndUpdate(userId, { $unset: { fcmToken: "" } });
        } catch (cleanupErr) {
          console.error("Error removing invalid token:", cleanupErr);
        }
      }
    }

    return { sent: false, error: err.message || String(err) };
  }
};



/**
 * Send FCM push only (do NOT create Notification document).
 * If token not provided, fetches user's fcmToken field.
 *
 * @param {String|null} userId - optional user _id
 * @param {String|null} token - optional fcm token override
 * @param {String} title
 * @param {String} message
 * @param {String} type
 * @returns {Object} { sent: boolean, messageId?: string, error?: string, reason?: string }
 */
async function sendPushOnly(userId, token, title, message, type = "Other",) {
  try {
    // Determine token to use
    let fcmToken = token;
    if (!fcmToken && userId) {
      const user = await User.findById(userId).select("fcmToken");
      fcmToken = user && user.fcmToken;
    }

    if (!fcmToken) {
      return { sent: false, reason: "no-token", error: "No FCM token provided or found for user" };
    }

    const messagePayload = {
      token: fcmToken,
      notification: {
        title,
        body: message,
      },
      data: {
        title,
        body: message,
        type: typeof type === "string" ? type : JSON.stringify(type),
      },
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" } },
    };

    const result = await admin.messaging().send(messagePayload);
    // result is a messageId string
    return { sent: true, messageId: result };
  } catch (err) {
    console.error("❌ sendPushOnly error:", err);

    // Try to cleanup invalid token if firebase tells us
    try {
      const errCode = err && err.errorInfo && err.errorInfo.code;
      if (errCode === "messaging/registration-token-not-registered" || errCode === "messaging/invalid-registration-token") {
        if (token) {
          // remove this token globally
          await User.updateMany({}, { $pull: { fcmToken: token } });
        } else if (userId) {
          // remove fcmToken from this user only
          await User.findByIdAndUpdate(userId, { $unset: { fcmToken: "" } });
        }
      }
    } catch (cleanupErr) {
      console.error("Error cleaning up invalid token:", cleanupErr);
    }

    return { sent: false, error: err.message || String(err) };
  }
}


module.exports = { sendNotification, sendPushOnly };
