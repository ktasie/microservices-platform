import { promisify } from 'util';
import fs from 'fs';
import jwt from 'jsonwebtoken';

// Read public key from filesystem to decode jwt
const pubKey = fs.readFileSync('./../keys/jwt_rsa.pub', 'utf8');

const protect = async (req, res, next) => {
  try {
    let token;
    // 1. Get token and check if its there

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const err = new Error('You are not logged in! Please log in to get access.');
      err.statusCode = 401;
      return next(err);
    }

    const decoded = await promisify(jwt.verify)(token, pubKey, { algorithms: 'RS256' });
    
    req.user = decoded.user;
    //console.log(req.user)
    next();
  } catch (err) {
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

export { protect };
