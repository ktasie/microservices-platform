import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { protect, login } from './controllers/authController.js';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(morgan('dev'));

app.post('/auth', express.json(), login);

app.use(
  '/comment',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:4002/api/v1/comment',
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (req.user) {
          proxyReq.setHeader('x-user', JSON.stringify(req.user));
        }
      },
    },
  })
);

app.use(
  '/like',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:4003/api/v1/like',
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (req.user) {
          proxyReq.setHeader('x-user', JSON.stringify(req.user));
        }
      },
    },
  })
);

app.use(
  '/upload',
  protect,
  createProxyMiddleware({
    target: 'http://localhost:4004/api/v1/photo',
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (req.user) {
          proxyReq.setHeader('x-user', JSON.stringify(req.user));
        }
      },
    },
  })
);

// error handling middleware for gateway.
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: 'fail',
    message: err,
  });
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log('Proxy gateway running on port 4000'));
