const { protect } = require('../controllers/authController');
const {
  addPost,
  updatePost,
  deletePost,
  likePost,
  getPost,
  getUserPosts,
  getUserTimeline,
} = require('../controllers/postController');

const router = require('express').Router();

router.post('/', addPost);
router.get('/timeline', protect, getUserTimeline);
router.get('/profile/:userId', getUserPosts);
router
  .route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);
router.put('/:id/like', likePost);

module.exports = router;
