const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const catchAsync = require('../util/catchAsync');

exports.createConv = catchAsync(async (req, res, next) => {
  const conv = await Conversation.findOne({
    members: { $all: [req.user._id, req.body.receiverId] },
  });

  if (conv)
    return res.status(200).json({
      status: 'success',
      conversation: conv,
    });

  const newConv = await Conversation.create({
    members: [req.user._id, req.body.receiverId],
  });

  const conversation = await newConv.populate({
    path: 'members',
    select: 'username name profilePicture email',
  });

  res.status(200).json({
    status: 'success',
    conversation,
  });
});

exports.getUserConv = catchAsync(async (req, res, next) => {
  const conv = await Conversation.find({
    members: { $in: [req.user._id] },
  });

  res.status(200).json({
    status: 'success',
    conversation: conv,
  });
});

exports.getTwoUserConv = catchAsync(async (req, res, next) => {
  const conv = await Conversation.findOne({
    members: { $all: [req.user._id, req.params.userId] },
  });

  res.status(200).json({
    status: 'success',
    conversation: conv,
  });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { text, conversation } = req.body;
  const sender = req.user._id;

  const newMessage = await Message.create({
    conversation,
    sender,
    text,
  });

  const message = await newMessage.populate({
    path: 'sender',
    select: 'name profilePicture',
  });

  res.status(200).json({
    status: 'success',
    message,
  });
});

exports.getUserMessages = catchAsync(async (req, res, next) => {
  const conversation = req.params.covId;

  const messages = await Message.find({ conversation });

  res.status(200).json({
    status: 'success',
    messages,
  });
});
