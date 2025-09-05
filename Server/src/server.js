require('dotenv').config();
require('express-async-errors');
const path = require("path");

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));


// const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname + "/uploads")));


// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ ok: false, message: err.message || 'Server error' });
});

(async () => {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API running on :${port}`));

})();
