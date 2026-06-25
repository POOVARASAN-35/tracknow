const express = require('express');
const router = express.Router();
const { createZone, getZones, deleteZone } = require('../controllers/zoneController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getZones)
  .post(authorize('admin', 'superadmin'), createZone);

router.delete('/:id', authorize('admin', 'superadmin'), deleteZone);

module.exports = router;
