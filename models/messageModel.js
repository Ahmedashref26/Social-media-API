const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation',
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
      required: [true, 'A message must contain a text'],
    },
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'sender',
    select: 'name profilePicture email',
  });
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
