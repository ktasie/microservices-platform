import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  authorEmail: {
    type: String,
    required: true,
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'An image is needed to post a comment.'],
  },
  comment: {
    type: String,
    required: [true, 'Please provide an comment'],
  },
});

const Comment = mongoose.model('comments', commentSchema);
export default Comment;
