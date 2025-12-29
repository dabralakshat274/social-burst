// services/schedulerService.js
const cron = require("node-cron");
const path = require("path");
const Event = require("../models/event_Model");
const Notification = require("../models/notification_Model");
const User = require("../models/userModel");
const { sendNotification } = require("./notificationHelper");

// Config: adjust timezone and daily hour (24h)
const TZ = process.env.SCHEDULER_TZ || "UTC";
const DAILY_HOUR = process.env.DAILY_SUMMARY_HOUR || "0"; // default 0 => midnight
const DAILY_SUMMARY_CRON = `0 ${DAILY_HOUR} * * *`; // runs at minute 0 of DAILY_HOUR
const REMINDER_MINUTES_BEFORE = Number(
  process.env.REMINDER_MINUTES_BEFORE || 30
);
// run every minute to catch events starting in ~30 min
const REMINDER_CRON = "*/1 * * * *"; // every minute

/**
 * Send 30-minute reminders for events starting soon.
 */
async function runReminderCheck() {
  try {
    const now = new Date();
    const target = new Date(
      now.getTime() + REMINDER_MINUTES_BEFORE * 60 * 1000
    );

    // small window tolerance (e.g., 30s before to 90s after)
    const windowStart = new Date(target.getTime() - 30 * 1000);
    const windowEnd = new Date(target.getTime() + 90 * 1000);

    // Find events starting in that window and that are published
    const events = await Event.find({
      startDate: { $gte: windowStart, $lte: windowEnd },
      status: "published",
    }).populate("attendees createdBy", "_id name email fcmToken");

    if (!events.length) return;

    for (const event of events) {
      // Notification content
      const title = "Reminder: Your event starts in 30 minutes!";
      // const eventUrl = event._id ? `/events/${event._id}` : "/events";
      const bodyShort = `Your event "${event.title}" starts in ${REMINDER_MINUTES_BEFORE} minutes`;
      // ).toLocaleString()}. Open: ${eventUrl}`;

      // target users: attendees array (if empty, optionally notify createdBy)
      const recipients =
        event.attendees && event.attendees.length
          ? event.attendees
          : event.createdBy
            ? [event.createdBy]
            : [];

      for (const userRef of recipients) {
        // if attendees are ObjectId only, fetch user doc
        let user = userRef;
        if (!user || !user.fcmToken || !user._id) {
          user = await User.findById(userRef).select("_id fcmToken");
        }

        if (!user || !user._id) continue;

        // Check if we already sent a reminder for this event to this user
        // We use type="Event", typeId=event._id, and check the title to coincide with this specific reminder
        const alreadySent = await Notification.findOne({
          users: user._id,
          type: "Event",
          typeId: event._id,
          title: title, // "Reminder: Your event starts in 30 minutes!"
        });

        if (alreadySent) {
          continue;
        }

        // Send with object-style signature and include eventId
        try {
          await sendNotification({
            userId: user._id,
            token: user.fcmToken,
            title,
            message: bodyShort,
            isAdminMessage: true,
            type: "Event",
            typeId: event._id,
          });
        } catch (err) {
          console.error(
            `Error sending reminder to user ${user._id} for event ${event._id}:`,
            err
          );
        }
      }
    }
  } catch (err) {
    console.error("runReminderCheck error:", err);
  }
}

/**
 * Send daily summary: for each user with events today, send one summary
 */
async function runDailySummary() {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await Event.find({
      startDate: { $gte: startOfDay, $lte: endOfDay },
      status: "published",
    }).populate("attendees createdBy", "_id name email fcmToken");

    if (!events.length) return;

    // Map userId -> events list
    const userMap = new Map();
    for (const ev of events) {
      const users =
        ev.attendees && ev.attendees.length
          ? ev.attendees
          : ev.createdBy
            ? [ev.createdBy]
            : [];
      for (const uRef of users) {
        const uid = String(uRef._id ? uRef._id : uRef);
        if (!userMap.has(uid)) userMap.set(uid, { user: uRef, events: [] });
        userMap.get(uid).events.push(ev);
      }
    }

    const dateKey = startOfDay.toISOString().slice(0, 10);

    for (const [uid, payload] of userMap.entries()) {
      const user =
        payload.user && payload.user._id
          ? payload.user
          : await User.findById(uid).select("_id fcmToken");
      if (!user) continue;

      // Dedupe using the Calender type + daily marker in body
      const already = await Notification.findOne({
        users: user._id,
        type: "Calender", // <- changed from "System" to "Calender"
        body: { $regex: `\\[daily:${dateKey}\\]` },
      });

      if (already) continue;

      const listText = payload.events
        .map(
          (e) => `• ${e.title} at ${new Date(e.startDate).toLocaleTimeString()}`
        )
        .join("\n");
      const body = `[daily:${dateKey}] Daily Event Summary: Check your upcoming plans!\n${payload.events.length} event(s) today:\n${listText}\nOpen calendar: /calendar`;

      try {
        await sendNotification({
          userId: user._id,
          token: user.fcmToken,
          title: "Daily Event Summary: Check your upcoming plans!",
          message: body,
          isAdminMessage: true,
          type: "Calender",
        });
      } catch (err) {
        console.error(`Error sending daily summary to ${uid}:`, err);
      }
    }
  } catch (err) {
    console.error("runDailySummary error:", err);
  }
}

/**
 * Start cron jobs (call once)
 */
function startScheduledJobs() {
  // reminders every minute
  cron.schedule(
    REMINDER_CRON,
    () => {
      runReminderCheck();
    },
    { timezone: TZ }
  );

  // daily summary at configured hour
  cron.schedule(
    DAILY_SUMMARY_CRON,
    () => {
      runDailySummary();
    },
    { timezone: TZ }
  );

  console.log(
    "Scheduler started. REMINDER cron:",
    REMINDER_CRON,
    "DAILY cron:",
    DAILY_SUMMARY_CRON,
    "TZ:",
    TZ
  );
}

module.exports = {
  startScheduledJobs,
  runReminderCheck,
  runDailySummary,
};
