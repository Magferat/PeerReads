const router = require('express').Router();
const { protect, requireAdmin } = require('../middleware/auth');
const {
    bootstrapAdmin, searchUsers, userActivity,
    updateBookStatus, deleteUser, resolveDamage, makeAdmin, getDamageReports
} = require('../controllers/adminController');

router.post('/bootstrap', bootstrapAdmin); // use once to create first admin
router.use(protect, requireAdmin);
router.get('/users', searchUsers);
router.get('/users/:id/activity', userActivity);
router.patch('/books/:bookId/status', updateBookStatus);
router.delete('/users/:id', deleteUser);
router.get('/damage', getDamageReports);
router.post('/damage/:reportId/resolve', resolveDamage);
router.post("/make-admin", makeAdmin);


module.exports = router;
