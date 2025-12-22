import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'A full name is required!'],
    maxlength: [20, 'Your first name is too long!'],
  },
  lastName: {
    type: String,
    required: [true, 'A full name is required'],
    maxlength: [20, 'Your last name is too long!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    // validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide in a password'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

const User = mongoose.model('users', userSchema);
export default User;
