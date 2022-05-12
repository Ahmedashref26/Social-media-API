const { protect } = require('../controllers/authController');
const {
  createConv,
  getUserConv,
  sendMessage,
  getUserMessages,
  getTwoUserConv,
} = require('../controllers/conversationController');

const router = require('express').Router();

router.use(protect);

router.route('/').get(getUserConv).post(createConv);
router.post('/messages', sendMessage);
router.get('/find/:userId', getTwoUserConv);
router.get('/:covId/messages', getUserMessages);

module.exports = router;
