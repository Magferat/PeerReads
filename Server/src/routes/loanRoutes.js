const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
    markOnDelivery, markAtBorrower, requestReturn, confirmReturnOk,
    reportDamage, myLoans
} = require('../controllers/loanController');

router.post('/on-delivery', protect, markOnDelivery);
router.post('/at-borrower', protect, markAtBorrower);
router.post('/request-return', protect, requestReturn);
router.post('/return-ok', protect, confirmReturnOk);
router.post('/damage', protect, reportDamage);
router.get('/mine', protect, myLoans);

module.exports = router;
