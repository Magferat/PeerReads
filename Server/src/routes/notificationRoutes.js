const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { mine, markRead } = require('../controllers/notificationController');

router.use(protect);
router.get('/my', mine);
router.patch('/:id/read', markRead);

module.exports = router;
