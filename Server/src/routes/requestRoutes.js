const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createRequest, lenderApprove, lenderReject } = require('../controllers/requestController');

router.post('/', protect, createRequest);
router.post('/approve', protect, lenderApprove);
router.post('/reject', protect, lenderReject);

module.exports = router;
