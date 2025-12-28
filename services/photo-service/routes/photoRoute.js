import express from 'express';
import { uploadPhoto, getPhotos, getOnePhoto } from './../controllers/photoController.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, //5mb limit
});

router.get('/photo/', getPhotos).get('/photo/:imageId', getOnePhoto).post('/photo/',upload.single('image'), uploadPhoto);

export default router;
