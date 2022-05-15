const Comment = require('../models/commentModel');
const catchAsync = require('../util/catchAsync');

exports.addComment = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.post) req.body.post = req.params.postId;

  const newComment = await Comment.create(req.body);

  const comment = await newComment.populate({
    path: 'user',
    select: 'name profilePicture',
  });

  res.status(201).json({
    status: 'success',
    comment,
  });
});

exports.getPostComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.postId });

  res.status(200).json({
    status: 'success',
    comments,
  });
});
