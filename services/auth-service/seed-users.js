import mongoose from 'mongoose';
import User from './models/userModel.js';

const members = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: '$2b$10$UdHW/5yjepYd3q2jqcqh5.5XmGniXgfA0F.XhpFFajwsjdXP886qe',
    role: 'admin',
  },
  {
    firstName: 'Kelechukwu',
    lastName: 'Tasie',
    email: 'ktasie@example.com',
    password: '$2b$10$E1ixQUKUDyIfCWDBUKcCleb9EWFK38w0aqV7qd8nULekSExMeRbwO',
  },
];

const seedUsers = async () => {
  try {
    // Database connection.
    if (process.env.NODE_ENV === 'development') {
      await mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`);
    } else if (process.env.NODE_ENV === 'production') {
      const DB = process.env.COSMOS_STRING.replace('<DBNAME>', process.env.MONGO_DB);
      await mongoose.connect(DB);
    }

    // create initial users to login
    const users = await User.insertMany(members);
    if (!users) {
      console.log('Problem creating seed users. Please try again');
    } else {
      console.log('Seeding complete');
    }
  } catch (err) {
    console.error('Seed failed', err.message);
  } finally {
    // close mongo connection
    await mongoose.connection.close();
  }
};

seedUsers();
