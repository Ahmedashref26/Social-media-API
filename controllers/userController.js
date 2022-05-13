const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const catchAsync = require('../util/catchAsync');

exports.getUser = catchAsync(async (req, res, next) => {
  const { userId, username } = req.query;

  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ username });

  if (!user) throw new Error('There is no user with that id or username');

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
    return res.status(404).json({
      status: 'failed',
      message: 'There is no user with that ID',
    });

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
      message: 'account updated successfully',
      user: updatedUser,
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
  if (req.user._id === req.params.id)
    return res.status(400).json({
      status: 'failed',
      message: "You can't follow yourself",
    });

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
    return res.status(400).json({
      status: 'failed',
      message: 'You already following this user',
    });
  }
});

exports.unFollowUser = catchAsync(async (req, res, next) => {
  if (req.user._id === req.params.id)
    return res.status(400).json({
      status: 'failed',
      message: "You can't unfollow yourself",
    });

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
    return res.status(400).json({
      status: 'failed',
      message: "You don't follow this user",
    });
  }
});
