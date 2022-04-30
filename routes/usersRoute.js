const { signup, login } = require('../controllers/authController');
const {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unFollowUser,
} = require('../controllers/userController');

const router = require('express').Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/follow', followUser);
router.put('/:id/unfollow', unFollowUser);
router.delete('/:id', deleteUser);

module.exports = router;
