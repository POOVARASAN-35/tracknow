const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsRead, markSingleNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .put(markNotificationsRead);

router.route('/:id')
  .put(markSingleNotificationRead);

module.exports = router;
