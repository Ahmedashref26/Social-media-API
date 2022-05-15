const {
  signup,
  login,
  protect,
  updatePassword,
} = require('../controllers/authController');
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
router.get('/friends/:id', getUserFriends);

router.use(protect);

router.put('/updateMyPassword', updatePassword);
router.put('/updateMe', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/follow', followUser);
router.put('/:id/unfollow', unFollowUser);

module.exports = router;
