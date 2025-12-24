import mongoose from 'mongoose';
import Like from './../models/likeModel.js';

const getLikes = async (req, res) => {
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

    const data = await Like.find({ targetId:imageId });

    res.status(200).json({
      status: 'Success',
      Likes: data.length,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: `${err.message}`,
    });
  }
};

const postLike = async (req, res) => {
  try {
    // Receive incoming json fields
    const { targetType } = req.body;
    const { targetId } = req.params;

    if (req.headers['x-user']) {
      try {
        req.user = JSON.parse(req.headers['x-user']);
      } catch {
        req.user = null;
      }
    }
    const userId = req.user._id;

    // console.log(email, password);
    if (!targetId) {
      const err = new Error('An image has to be selected to like.');
      err.statusCode = 400;
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      const err = new Error('Invalid imageId.');
      err.statusCode = 400;
      throw err;
    }

    const newLike = await Like.create({
      authorId: userId,
      targetId,
      targetType,
    });

    // console.log(newComment);
    res.status(201).json({
      status: 'success',
      liked: true,
    });
  } catch (err) {
    // console.log(err.message);
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: `${err.message}`,
    });
  }
};

export { postLike, getLikes };
