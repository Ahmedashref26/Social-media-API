const { protect } = require('../controllers/authController');
const {
  addComment,
  getPostComments,
} = require('../controllers/commentController');
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

router.post('/', protect, addPost);
router.get('/profile/:userId', getUserPosts);
router.get('/timeline', protect, getUserTimeline);
router
  .route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);
router.put('/:id/like', likePost);
router.get('/:postId/comments', getPostComments);
router.post('/:postId/comments', protect, addComment);

module.exports = router;
