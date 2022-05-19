const mongoose = require('mongoose');
const Comment = require('./commentModel');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      maxlength: 500,
    },
    image: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id',
});

postSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'user',
    select: 'username name profilePicture',
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
