const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const catchAsync = require('../util/catchAsync');

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    '-__v -isAdmin -createdAt -updatedAt'
  );

  if (!user) throw new Error('There is no user with that id');

  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      const salt = bcrypt.genSalt(12);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    return res.status(200).json({
      status: 'success',
      data: {
        message: 'account updated successfully',
        user: updatedUser,
      },
    });
  } else {
    return res.status(403).json({
      status: 'failed',
      message: 'You can only update your account',
    });
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } else {
    return res.status(403).json({
      status: 'failed',
      message: 'You can only update your account',
    });
  }
});

exports.followUser = catchAsync(async (req, res, next) => {
  if (req.body.userId === req.params.id)
    return res.status(400).json({
      status: 'failed',
      message: "You can't follow yourself",
    });

  const followedUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.body.userId);

  if (!followedUser.followers.includes(req.body.userId)) {
    await followedUser.updateOne({ $push: { followers: req.body.userId } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });

    return res.status(200).json({
      status: 'success',
      message: 'User has been followed',
    });
  } else {
    return res.status(400).json({
      status: 'failed',
      message: 'You already following this user',
    });
  }
});

exports.unFollowUser = catchAsync(async (req, res, next) => {
  if (req.body.userId === req.params.id)
    return res.status(400).json({
      status: 'failed',
      message: "You can't unfollow yourself",
    });

  const followedUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.body.userId);

  if (followedUser.followers.includes(req.body.userId)) {
    await followedUser.updateOne({ $pull: { followers: req.body.userId } });
    await currentUser.updateOne({ $pull: { followings: req.params.id } });

    return res.status(200).json({
      status: 'success',
      message: 'User has been unfollowed',
    });
  } else {
    return res.status(400).json({
      status: 'failed',
      message: "You don't follow this user",
    });
  }
});
