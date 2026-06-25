const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', uploadImage);

module.exports = router;
