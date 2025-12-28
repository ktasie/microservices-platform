import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from './../models/userModel.js';

const privateKey = fs.readFileSync('./../../keys/jwt_rsa', 'utf8');
// console.log(privateKey)

const signToken = (user) => {
  // return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: `${process.env.JWT_EXPIRES_IN}h` });
  return jwt.sign({ user }, privateKey, { algorithm: 'RS256', expiresIn: `${process.env.JWT_EXPIRES_IN}h` });
};

const createSignToken = (user, statusCode, res) => {
  const token = signToken(user);

  // Does not need to return cookie token as it is handled by the gateway.
  /*
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_EXPIRES_IN * 3600 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', token, cookieOptions);
  */

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // console.log(email, password);
    if (!email || !password) {
      throw new Error('All fields are required');
    }

    // const hash = await bcrypt.hash(password, 10);
    // console.log(hash);

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const err = new Error('Username and password combination do not match.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const err = new Error('Username and password combination do not match.');
      err.statusCode = 401;
      throw err;
    }

    // hide the password from the output.
    user.password = undefined;

    // console.log(user, isMatch);
    createSignToken(user, 200, res);
  } catch (err) {
    console.log(err.message);
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: `${err.message}`,
    });
  }
};

export { login };
