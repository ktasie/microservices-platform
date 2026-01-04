import { promisify } from 'util';
import fs from 'fs';
import jwt from 'jsonwebtoken';

//const PRIVATE_KEY_PATH = process.env.JWT_PRIVATE_KEY_PATH || "/keys/jwt_rsa";
const PUBLIC_KEY_PATH = process.env.JWT_PUBLIC_KEY_PATH || './../keys/jwt_rsa.pub';

// Read public key from filesystem to decode jwt
const pubKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');

const protect = async (req, res, next) => {
  try {
    let token;
    // 1. Get token and check if its there

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      token = req.cookies.jwt;
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const raw = JSON.stringify({ email, password });

    const reqOptions = {
      method: 'POST',
      headers: { 'content-Type': 'application/json' },
      body: raw,
    };
    const resp = await fetch(`${process.env.AUTH_SERVICE}/api/v1/login`, reqOptions);
    const data = await resp.json();
    // console.log(data);
    if (data.status === 'fail') {
      const err = new Error(data.message);
      err.statusCode = 401;
      throw err;
    }

    const token = data.token;
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_EXPIRES_IN * 3600 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.francecentral.azurecontainerapps.io' : 'localhost',
      path: '/',
    };
    res.cookie('jwt', token, cookieOptions);
    res.json({
      status: data.status,
      token: token,
      data: data.data,
    });
  } catch (err) {
    //console.log(err.data);
    res.status(err.statusCode).json({ status: 'fail', message: err.message });
  }
};

export { protect, login };
