const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const userRoute = require('./routes/userRoutes');
const adminRoute = require('./routes/adminRoute');
dotenv.config();

const app = express();
const PORT = process.env.PORT;

connectDB();

// Configure CORS with proper cookie handling
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['set-cookie'],
}));

// Enable cookie parsing
app.use(cookieParser());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoute);
app.use('/api/admin', adminRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});