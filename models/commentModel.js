const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user.'],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'Comment must belong to a post.'],
    },
    comment: {
      type: String,
      required: [true, 'Comment can not be empty!'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profilePicture',
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
