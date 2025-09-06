const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
    markOnDelivery, markReceived, lenderRequestReturn, lenderConfirmOk,
    lenderReportDamage, myLoans, borrowerScheduleReturn, notReturning
} = require('../controllers/loanController');

router.post('/on-delivery', protect, markOnDelivery);
router.post('/at-borrower', protect, markReceived);
router.post('/request-return', protect, lenderRequestReturn);
// router.post("/confirm-ok", protect, borrowerConfirmOk);
// router.post("/report-damage", protect, borrowerReportDamage);
router.post("/schedule-return", protect, borrowerScheduleReturn);
router.post("/not-returning", protect, notReturning);

router.post("/confirm-ok", protect, lenderConfirmOk);
router.post("/report-damage", protect, lenderReportDamage);


router.get('/mine', protect, myLoans);

module.exports = router;
// borrowerScheduleReturn, lenderRequestReturn