const {
  addPost,
  updatePost,
  deletePost,
  likePost,
  getPost,
  getUserPosts,
} = require('../controllers/postController');

const router = require('express').Router();

router.post('/', addPost);
router.get('/timeline', getUserPosts);
router.route('/:id').get(getPost).put(updatePost).delete(deletePost);
router.put('/:id/like', likePost);

module.exports = router;
