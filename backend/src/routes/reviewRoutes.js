const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createReview);

module.exports = router;
