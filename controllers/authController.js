const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../util/appError');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (user, statusCode, req, res) => {
  const token = createToken(user._id);

  const cookieOpt = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOpt);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, name, email, password } = req.body;
  const newUser = await User.create({
    username,
    name,
    email,
    password,
  });

  newUser.password = undefined;
  // sendToken(newUser, 201, req, res);
  res.status(201).json({
    status: 'success',
    newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  sendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  const auth = req.headers.authorization;

  if (auth && auth.startsWith('Bearer')) token = auth.split(' ')[1];
  if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token)
    return next(
      new AppError('you are not logged in! please log in to access.', 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const verifiedUser = await User.findById(decoded.id);

  if (!verifiedUser)
    return next(
      new AppError('the user belonging to this user is no longer exist', 401)
    );

  req.user = verifiedUser;
  next();
});
