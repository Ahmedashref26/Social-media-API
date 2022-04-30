const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const usersRoute = require('./routes/usersRoute');
const postsRoute = require('./routes/postsRoute');

const app = express();

// Global Middlewares

// Body Parser
app.use(express.json({ limit: '10kb' }));

// Set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/posts', postsRoute);

module.exports = app;
