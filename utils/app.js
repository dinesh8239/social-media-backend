const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// const helmet = require('helmet');
// const xss = require('xss-clean');
// const rateLimit = require('express-rate-limit');

const app = express();

// Basic Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Security Middleware
// app.use(helmet());
// app.use(xss());
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 mins
//     max: 100, // limit per IP
//     message: "Too many requests, please try again later.",
//   })
// );

// Routes
const authRoutes = require('../routes/auth.routes.js');
const commentRoutes = require('../routes/comment.routes.js');
const friendRoutes = require('../routes/friend.routes.js');
const notificationRoutes = require('../routes/notification.routes.js');
const postRoutes = require('../routes/post.routes.js');
const userRoutes = require('../routes/user.routes.js');
const searchRoutes = require('../routes/search.routes.js')

app.use('/auth', authRoutes);
app.use('/chat', commentRoutes);
app.use('/', friendRoutes);
app.use('/notifications', notificationRoutes);
app.use('/upload', postRoutes);
app.use('/search', searchRoutes)
// app.use('/files', userRoutes);


app.get('/', (req, res) => {
    res.status(200).json({ message: 'welcome to the APIs' })
})

module.exports = app;