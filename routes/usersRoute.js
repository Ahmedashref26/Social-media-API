const { signup, login, protect } = require('../controllers/authController');
const {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unFollowUser,
  getUserFriends,
  searchUsers,
} = require('../controllers/userController');

const router = require('express').Router();

router.get('/', getUser);
router.post('/signup', signup);
router.post('/login', login);
router.get('/search', searchUsers);
router.put('/:id', updateUser);
router.get('/friends/:id', getUserFriends);
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unFollowUser);
router.delete('/:id', deleteUser);

module.exports = router;
