// socket/index.js
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("../models/message_Model");
const GroupChat = require("../models/groupChat_Model");
const User = require("../models/userModel");
const Notification = require("../models/notification_Model");
const notificationHelper = require("../services/notificationHelper");

let ioInstance = null;

function initSocket(server) {
  // initialize once
  if (ioInstance) {
    return ioInstance;
  }

  const io = new Server(server, {
    cors: {
      origin: "*", // restrict in production
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New user connected:", socket.id);

    // ----------------------
    // joinRoom — user opens/enters the group chat (room)
    // Mark unread messages as read by this user, then emit `messageRead`
    // ----------------------
    socket.on("joinRoom", async ({ groupId, userId }) => {
      try {
        const room = `group_${groupId}`;
        console.log(`joinRoom called: groupId=${groupId}, userId=${userId}`);

        if (!socket.rooms.has(room)) {
          socket.join(room);
          console.log(`User ${userId} joined room ${room}`);
        }

        // Mark unread messages in this group as read by this user
        const updateResult = await Message.updateMany(
          {
            groupId: mongoose.Types.ObjectId(groupId),
            isReadBy: { $ne: mongoose.Types.ObjectId(userId) },
          },
          { $addToSet: { isReadBy: mongoose.Types.ObjectId(userId) } }
        );

        const modifiedCount = updateResult.modifiedCount ?? updateResult.nModified ?? 0;
        if (modifiedCount > 0) {
          // find which message ids in this group now include this user in isReadBy
          const updatedMsgs = await Message.find({
            groupId: mongoose.Types.ObjectId(groupId),
            isReadBy: mongoose.Types.ObjectId(userId),
          })
            .select("_id")
            .lean();

          const messageIds = updatedMsgs.map((m) => String(m._id));
          // notify room that these messages were read by this user
          io.to(room).emit("messageRead", {
            groupId,
            userId,
            messageIds,
          });
        }

        // acknowledge join (optional)
        socket.emit("joinedRoom", { groupId, userId });
      } catch (err) {
        console.error("Error in joinRoom:", err);
      }
    });

    // ----------------------
    // sendGroupMessage — create and broadcast message with isReadBy initially containing sender
    // ----------------------
    socket.on("sendGroupMessage", async (payload) => {
      try {
        // Accept payload either directly or as { body: JSON-string }
        let messagePayload = payload.body ? JSON.parse(payload.body) : payload;
        const { groupId, sentBy, message } = messagePayload;

        console.log("Received message:", message);

        if (!groupId || !sentBy || !message || !message.trim()) {
          console.warn("⚠️ Invalid message payload:", messagePayload);
          return;
        }

        const group = await GroupChat.findById(groupId)
          .populate("members", "fcmToken name")
          .populate("event", "title");
        if (!group) {
          console.warn("❌ Group not found for message:", groupId);
          return;
        }

        // validate membership
        if (!group.members.some((m) => m._id.toString() === sentBy.toString())) {
          console.warn("⚠️ User is not a member of the group:", sentBy);
          return;
        }

        // create message — set isReadBy to include sender (they've "read" their own message)
        const newMsg = await Message.create({
          groupId,
          sentBy,
          message,
          isReadBy: [sentBy],
        });

        // update group messages list
        await GroupChat.findByIdAndUpdate(groupId, {
          $push: { messages: newMsg._id },
        });

        // populate and emit
        const populatedMessage = await Message.findById(newMsg._id)
          .populate("sentBy", "name profileImage email")
          .lean();

        const room = `group_${groupId}`;
        io.to(room).emit("receiveGroupMessage", populatedMessage);

        // Prepare notification payload
        const eventTitle = group.event?.title || "Group Chat";
        const sender = await User.findById(sentBy).select("name");
        const senderName = sender?.name || "Someone";
        const messagePreview =
          message.length > 100 ? `${message.substring(0, 100)}...` : message;

        const notificationPayload = {
          title: `${senderName} sent a message`,
          message: `In "${eventTitle}": ${messagePreview}`,
          type: "Chat",
          typeId: groupId,
          createdBy: sentBy,
        };

        const otherMemberIds = group.members
          .map((member) => member._id.toString())
          .filter((id) => id !== sentBy.toString());

        if (otherMemberIds.length > 0) {
          for (const memberId of otherMemberIds) {
            await notificationHelper.sendNotification({
              ...notificationPayload,
              userId: memberId,
            });
          }
        }
      } catch (err) {
        console.error("❌ Error in sendGroupMessage:", err.message, err);
      }
    });

    // ----------------------
    // markMessagesRead — explicit handler for client to report partial reads
    // payload: { groupId, messageIds: [...], userId }
    // Server updates DB and emits messageRead to the room
    // ----------------------
    socket.on("markMessagesRead", async ({ groupId, messageIds, userId }) => {
      try {
        if (!Array.isArray(messageIds) || messageIds.length === 0) return;
        const objIds = messageIds.map((id) => mongoose.Types.ObjectId(id));

        await Message.updateMany(
          { _id: { $in: objIds }, groupId: mongoose.Types.ObjectId(groupId) },
          { $addToSet: { isReadBy: mongoose.Types.ObjectId(userId) } }
        );

        // notify room so everyone updates their UI
        const room = `group_${groupId}`;
        io.to(room).emit("messageRead", {
          groupId,
          userId,
          messageIds,
        });
      } catch (err) {
        console.error("Error in markMessagesRead:", err);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
}

// getter accessible by controllers
function getIo() {
  return ioInstance;
}

module.exports = {
  initSocket,
  getIo,
};
