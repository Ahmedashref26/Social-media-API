const mongoose = require('mongoose');

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
  }
);

postSchema.pre(/^find/, function (next) {
  this.populate('user');
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
