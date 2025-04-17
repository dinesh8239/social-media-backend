const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require("../middlewares/upload.middleware.js");
const {register, login} = require('../controllers/auth.controller.js')

router.post(
    "/register",
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    register
  );
// router.post('/register', upload.single('avatar'), register);
router.route('/login').post(login)

module.exports = router;
