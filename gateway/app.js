import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import { protect } from './controllers/authController.js';

const app = express();

app.use(morgan('dev'));

app.use('/auth', createProxyMiddleware({ target: 'http://localhost:4001/api/v1/login', changeOrigin: true }));
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
    message: err.message,
  });
});

app.listen(4000, () => console.log('Proxy gateway running on port 4000'));
