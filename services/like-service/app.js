import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import mongoose from 'mongoose';
// import cookieParser from 'cookie-parser';
import likeRoute from './routes/likeRoute.js';

const port = process.env.PORT | 4000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/v1/', likeRoute);

// Database connection.
if (process.env.NODE_ENV === 'development') {
  mongoose
    .connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`)
    .then(() => console.log('Like service DB connection successful'))
    .catch((err) => {
      console.log(err.message);
      process.exit();
    });
} else if (process.env.NODE_ENV === 'production') {
  mongoose
    .connect(
      `mongodb:${process.env.MONGO_USER}:${process.env.MONGO_PASS}//${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
    )
    .then(() => console.log('Like service DB connection successful'))
    .catch((err) => {
      console.log(err.message);
      process.exit();
    });
}

// start webserver
app.listen(port, () => {
  console.log(`Like service listening on port ${port}`);
});
