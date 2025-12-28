import express from 'express';
import { getLoginForm, goToDashboard, protect, uploadPhoto, getPhoto } from './../controllers/viewsController.js';

const router = express.Router();

router.get('/', getLoginForm);
router.get('/dashboard', protect, goToDashboard);
router.get('/upload/:imageId', protect, getPhoto);
router.get('/upload', protect, uploadPhoto);


export default router;
