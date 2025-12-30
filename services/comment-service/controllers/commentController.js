import mongoose from 'mongoose';
import Comment from './../models/commentModel.js';

const getComments = async (req, res) => {
  try {
    const { imageId } = req.params;

    if (!imageId) {
      const err = new Error('An image has to be selected to get more information');
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      const err = new Error('Invalid imageId.');
      err.statusCode = 400;
      throw err;
    }

    const data = await Comment.find({ imageId });

    res.status(200).json({
      status: 'Success',
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: `${err.message}`,
    });
  }
};

const postComment = async (req, res) => {
  try {
    // Receive incoming json fields
    const { imageId, commentText } = req.body;

    if (req.headers['x-user']) {
      try {
        req.user = JSON.parse(req.headers['x-user']);
      } catch {
        req.user = null;
      }
    }
    const authorEmail = req.user.email;

    // console.log(email, password);
    if (!imageId || !commentText) {
      const err = new Error('All fields are required');
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      const err = new Error('Invalid imageId.');
      err.statusCode = 400;
      throw err;
    }

    const newComment = await Comment.create({
      authorEmail,
      imageId,
      comment: commentText,
    });

    // console.log(newComment);
    res.status(201).json({
      status: 'success',
      message: `${newComment._id} submitted successfully.`,
    });
  } catch (err) {
    // console.log(err.message);
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: `${err.message}`,
    });
  }
};

export { postComment, getComments };
