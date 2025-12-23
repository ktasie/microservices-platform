import express from 'express';
import { postComment, getComments } from './../controllers/commentController.js';

const router = express.Router();

router.get('/comment/:imageId', getComments).post('/comment', postComment);

export default router;
