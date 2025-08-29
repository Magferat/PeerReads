// const router = require('express').Router();
// const { protect } = require('../middleware/auth');
// const { createRequest, lenderApprove, lenderReject } = require('../controllers/requestController');

// router.post('/', protect, createRequest);
// router.post('/approve', protect, lenderApprove);
// router.post('/reject', protect, lenderReject);

// module.exports = router;
const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
    createRequest,
    lenderApprove,
    lenderReject,
    myRequests,
    requestsForMe,
    cancelRequest,
    borrowerProceed,
    borrowerDecline
} = require('../controllers/requestController');

router.post('/', protect, createRequest);
router.post('/approve', protect, lenderApprove);
router.post('/reject', protect, lenderReject);
// ===
router.post("/cancel", protect, cancelRequest);
router.post("/proceed", protect, borrowerProceed);
router.post("/decline", protect, borrowerDecline);
// ==
// New endpoints
router.get('/mine', protect, myRequests);        // requests I sent
router.get('/for-me', protect, requestsForMe);   // requests others sent me

module.exports = router;
