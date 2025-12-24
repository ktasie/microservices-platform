import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'A user id is needed to like a target'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'An target is needed to like.'],
    },
    targetType: {
      type: String,
      enum: ['photo', 'comment'],
      required: true,
      default: 'photo',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

likeSchema.index({ authorId: 1, targetId: 1, targetType: 1 }, { unique: true });

const Like = mongoose.model('likes', likeSchema);

export default Like;
