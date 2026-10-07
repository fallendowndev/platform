require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./db/connectDB');
const authRoutes = require('./routes/auth.route');
const bookRoutes = require('./routes/book.route');
const videoRoutes = require('./routes/video.route');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

connectDB();

const isDev = process.env.NODE_ENV === 'development';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: isDev ? null : [],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);

// Global general rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'تم تجاوز عدد الطلبات المسموح بها، يرجى الانتظار قليلاً' },
  })
);

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(cookieParser());

if (isDev) {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/videos', videoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'الصفحة غير موجودة' });
});

app.use(errorHandler);

const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
