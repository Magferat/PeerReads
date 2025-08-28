const router = require('express').Router();
const { register, login, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', protect, changePassword);

module.exports = router;
