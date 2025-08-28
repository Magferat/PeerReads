const router = require('express').Router();
const { protect, requireAdmin } = require('../middleware/auth');
const {
    bootstrapAdmin, searchUsers, userActivity,
    updateBookStatus, deleteUser, resolveDamage
} = require('../controllers/adminController');

router.post('/bootstrap', bootstrapAdmin); // use once to create first admin
router.use(protect, requireAdmin);
router.get('/users', searchUsers);
router.get('/users/:id/activity', userActivity);
router.patch('/books/:bookId/status', updateBookStatus);
router.delete('/users/:id', deleteUser);
router.post('/damage/:reportId/resolve', resolveDamage);

module.exports = router;
