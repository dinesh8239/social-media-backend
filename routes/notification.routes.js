const express = require("express")
const router = express.Router()

const { createNotification, getNotifications, markAsRead, deleteNotification } = require("../controllers/notification.controller.js")

const verifyJWT = require("../middlewares/auth.middleware.js")


router.route("/").post(verifyJWT, createNotification);
router.route("/").get(verifyJWT, getNotifications);
router.route("/:notificationId/read").put(verifyJWT, markAsRead);
router.route("/:notificationId").delete(verifyJWT, deleteNotification);

module.exports = router
