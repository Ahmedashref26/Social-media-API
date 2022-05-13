const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥Shutting down...!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const app = require('./app');

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥Shutting down...!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RESEIVED, Shutting down gracefully');
  server.close(() => {
    console.log('💥💥 Process Terminated!');
  });
});
