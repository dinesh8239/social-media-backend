const Notification = require("../models/notification.model.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");

// 1. Create Notification
exports.createNotification = asyncHandler(async (req, res) => {
  const { receiver, type, message } = req.body;
  const sender = req.user._id;

  if (!receiver || !type) {
    throw new ApiError(400, "Receiver and type are required");
  }

  const notification = await Notification.create({
    sender,
    receiver,
    type,
    message,
    isRead: false
  });

// Send real-time notification
io.to(receiver).emit("notification", {
    id: notification._id,
    sender,
    type,
    message,
    createdAt: notification.createdAt,
  });

  return res.status(201).json(
    new ApiResponse(201, notification, "Notification created successfully")
  );
});

// 2. Get All Notifications for logged-in user
exports.getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ receiver: userId })
    .populate("sender", "userName avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notifications, "Notifications fetched successfully")
  );
});

// 3. Mark Notification as Read
exports.markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

// 4. Delete Notification
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByIdAndDelete(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification deleted successfully")
  );
});

