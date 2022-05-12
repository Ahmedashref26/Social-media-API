const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

conversationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'members',
    select: 'username name profilePicture email',
  });
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
