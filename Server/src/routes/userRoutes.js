const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMyProfile, updateMyProfile, topUp, activity, getUserProfile } = require('../controllers/userController');

router.get("/me", protect, getMyProfile);       // Get my profile
router.put("/me", protect, updateMyProfile);    // Update my profile
router.get("/profile/:id", protect, getUserProfile);
router.post('/topup', protect, topUp);
router.get('/activity', protect, activity);

module.exports = router;
