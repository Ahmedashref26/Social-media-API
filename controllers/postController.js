const Post = require('../models/postModel');
const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) throw new Error('There is no user with that id');

  res.status(200).json({
    status: 'success',
    post,
  });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.params.userId);
  const userPosts = await Post.find({ user: currentUser._id });

  res.status(200).json({
    status: 'success',
    posts: userPosts,
  });
});

exports.getUserTimeline = catchAsync(async (req, res, next) => {
  const currentUser = req.user;
  const userPosts = await Post.find({ user: currentUser._id });
  const friendsPosts = await Promise.all(
    currentUser.followings.map((friendId) => Post.find({ user: friendId }))
  );
  const allUserPosts = userPosts.concat(...friendsPosts);

  res.status(200).json({
    status: 'success',
    posts: allUserPosts,
  });
});

exports.addPost = catchAsync(async (req, res, next) => {
  const post = {
    user: req.body.userId,
    description: req.body.description,
    image: req.body.image,
  };
  const newPost = await Post.create(post);

  res.status(201).json({
    status: 'success',
    post: newPost,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (post.user.toHexString() !== req.body.userId) {
    return next(new AppError('You can only update your posts', 400));
  }

  await post.updateOne({ $set: req.body });

  res.status(200).json({
    status: 'success',
    message: 'Post updated successfully',
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (post.user._id.toHexString() !== req.user._id.toHexString()) {
    return next(new AppError('You can only delete your posts', 400));
  }

  await post.deleteOne();

  res.status(204).json({
    status: 'success',
    message: 'Post has been deleted successfully',
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post.likes.includes(req.body.userId)) {
    await post.updateOne({ $push: { likes: req.body.userId } });
    return res.status(200).json({
      status: 'success',
      message: 'post has been liked',
    });
  } else {
    await post.updateOne({ $pull: { likes: req.body.userId } });
    return res.status(200).json({
      status: 'success',
      message: 'post has been disliked',
    });
  }
});
