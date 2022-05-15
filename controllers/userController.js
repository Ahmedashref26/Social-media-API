const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.getUser = catchAsync(async (req, res, next) => {
  const { userId, username } = req.query;

  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ username });

  if (!user)
    return next(new AppError('There is no user with that id or username', 404));

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.searchUsers = catchAsync(async (req, res, next) => {
  const { q, limit = 0 } = req.query;

  // const regex = { $regex: q, $options: 'i' };
  // const users = await User.find({
  //   $or: [{ name: regex }, { username: regex }, { email: regex }],
  // });
  const users = await User.find({ name: { $regex: q, $options: 'i' } }).limit(
    limit
  );

  const total = await User.countDocuments({
    name: { $regex: q, $options: 'i' },
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    users,
  });
});

exports.getUserFriends = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.params.id);
  if (!currentUser)
    return next(new AppError('There is no user with that ID', 404));

  const friends = await Promise.all(
    currentUser.followings.map((friend) =>
      User.findById(friend).select('_id profilePicture username name')
    )
  );

  res.status(200).json({
    status: 'success',
    friends,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password)
    return next(
      new AppError(
        'This route is not for password updates please use /updateMyPassword',
        400
      )
    );

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: req.body,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(200).json({
    status: 'success',
    message: 'account updated successfully',
    user: updatedUser,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } else {
    return next(new AppError('You can only update your account', 403));
  }
});

exports.followUser = catchAsync(async (req, res, next) => {
  if (req.user._id === req.params.id)
    return next(new AppError("You can't follow yourself", 400));

  const followedUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!followedUser.followers.includes(req.user._id)) {
    await followedUser.updateOne({ $push: { followers: req.user._id } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });

    return res.status(200).json({
      status: 'success',
      message: 'User has been followed',
    });
  } else {
    return next(new AppError('You already following this user', 400));
  }
});

exports.unFollowUser = catchAsync(async (req, res, next) => {
  if (req.user._id === req.params.id)
    return next(new AppError("You can't unfollow yourself", 400));

  const followedUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (followedUser.followers.includes(req.user._id)) {
    await followedUser.updateOne({ $pull: { followers: req.user._id } });
    await currentUser.updateOne({ $pull: { followings: req.params.id } });

    return res.status(200).json({
      status: 'success',
      message: 'User has been unfollowed',
    });
  } else {
    return next(new AppError("You don't follow this user", 400));
  }
});
