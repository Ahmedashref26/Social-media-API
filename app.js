const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const multer = require('multer');
const path = require('path');

const AppError = require('./util/appError');
const errorHandler = require('./controllers/errorController');
const usersRoute = require('./routes/usersRoute');
const postsRoute = require('./routes/postsRoute');
const conversationRoute = require('./routes/conversationRoute');
const { protect } = require('./controllers/authController');

const app = express();

app.enable('trust proxy');

// Global Middlewares

// Implementing Cors
app.use(cors());
app.options('*', cors());

// Serving static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requrests from the same IP
const limiter = rateLimit({
  max: 200,
  windowMs: 3600000,
  message: 'Too many requests from this IP, Please try agian in an hour!',
});
app.use('/api', limiter);

// Data sanitization against XSS
app.use(xss());

app.use(compression());

// upload images
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `post-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please only upload images.'));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadPhoto = upload.single('file');

app.post('/api/v1/upload', protect, uploadPhoto, (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'file uploaded successfully!',
      filename: req.file.filename,
    });
  } catch (err) {
    console.error(err);
  }
});

// Routes
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/posts', postsRoute);
app.use('/api/v1/conversation', conversationRoute);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
