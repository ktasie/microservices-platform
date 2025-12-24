import express from 'express';
import { postLike, getLikes } from './../controllers/likeController.js';

const router = express.Router();

router.get('/like/:imageId', getLikes).post('/like/:targetId', postLike);

export default router;