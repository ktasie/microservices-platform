import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    blobName: {
      type: String,
      required: [true, 'A blob name is required'],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'A title is required'],
      trim: true,
    },
    caption: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      required: [true, 'You need to type the location'],
    },
    peoplePresent: {
      type: String,
      required: [true, 'You need to identify people present'],
      trim: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId, 
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);


const Photo = mongoose.model('photo', photoSchema);

export default Photo;
