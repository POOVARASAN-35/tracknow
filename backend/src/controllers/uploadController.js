const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials are provided in env
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary storage SDK configured successfully');
} else {
  console.warn('Cloudinary credentials missing in .env. Falling back to local storage serving.');
}

/**
 * @desc    Upload image base64 format
 * @route   POST /api/upload
 * @access  Private
 */
const uploadImage = async (req, res, next) => {
  const { image } = req.body; // Expects base64 data URL

  try {
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Upload to Cloudinary
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'trackflow_proofs',
          resource_type: 'image'
        });
        return res.status(200).json({
          success: true,
          url: uploadResponse.secure_url,
          provider: 'cloudinary'
        });
      } catch (cloudinaryErr) {
        console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryErr.message);
      }
    }

    // Fallback: Local file system upload
    // Clean base64 prefix safely without regular expressions to handle large images without regex stack limits
    let mimeType = 'image/png';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const parts = image.split(';base64,');
      if (parts.length === 2) {
        mimeType = parts[0].split(':')[1];
        base64Data = parts[1];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid base64 image format' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid base64 image format' });
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const extension = mimeType.split('/')[1] || 'png';
    const filename = `proof-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${extension}`;
    
    // Ensure uploads directory exists inside src or parent
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, imageBuffer);

    const localUrl = `/uploads/${filename}`;

    res.status(200).json({
      success: true,
      url: localUrl,
      provider: 'local'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage
};
