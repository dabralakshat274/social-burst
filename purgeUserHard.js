// services/purgeUserHard.js
const User = require("../models/userModel");
// const Feedback = require("../models/feedback_Model"); // omit deletion to keep feedback

async function purgeUserHard(userId, { session } = {}) {
  // delete dependent docs first (NOT feedback if you want to keep it)
  await Promise.all([
    // Post.deleteMany({ author: userId }).session(session),
    // Notification.deleteMany({ user: userId }).session(session),
  ]);
  const { deletedCount } = await User.deleteOne({ _id: userId }).session(session);
  return { ok: true, deletedUser: deletedCount ?? 0 };
}

module.exports = { purgeUserHard };
