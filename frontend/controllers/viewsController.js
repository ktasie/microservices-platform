import fs from 'fs';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

const pubKey = fs.readFileSync('./../keys/jwt_rsa.pub', 'utf8');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      const err = new Error('You are not logged in! Please log in to get access.');
      err.statusCode = 401;
      return next(err);
    }

    const decoded = await promisify(jwt.verify)(token, pubKey, { algorithms: 'RS256' });
    // console.log(decoded)

    req.locals = decoded.user;

    next();
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

const getLoginForm = async (req, res) => {
  res.status(200).render('login', { title: 'Sign in', pretty: true });
};

const goToDashboard = async (req, res) => {
  const uploads = await (
    await fetch('http://localhost:4000/upload', { method: 'GET', headers: { Cookie: req.headers.cookie || '' } })
  ).json();
  //console.log(uploads);
  res.status(200).render('dashboard', { title: 'Dashboard', pretty: true, user: req.locals, uploads });
};

const uploadPhoto = async (req, res) => {
  res.status(200).render('upload', { title: 'upload', pretty: true, user: req.locals });
};

const getPhoto = async (req, res) => {
  // fetch single image from endpoint.
  const imageId = req.params.imageId;

  const image = await (
    await fetch(`http://localhost:4000/upload/${imageId}`, {
      method: 'GET',
      headers: { Cookie: req.headers.cookie || '' },
    })
  ).json();

  const likeCount = await (
    await fetch(`http://localhost:4000/like/${imageId}`, {
      method: 'GET',
      headers: { Cookie: req.headers.cookie || '' },
    })
  ).json();

  // get comments
  const comment = await (
    await fetch(`http://localhost:4000/comment/${imageId}`, {
      method: 'GET',
      headers: { Cookie: req.headers.cookie || '' },
    })
  ).json();

  // console.log(comment);

  res
    .status(200)
    .render('single', {
      title: 'image-title',
      pretty: true,
      user: req.locals,
      image: image.photo,
      likeCount,
      allComment: comment.data,
    });
};

export { getLoginForm, goToDashboard, protect, uploadPhoto, getPhoto };
