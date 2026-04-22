const multer = require('multer');
const { sendError } = require('../../utils/response');

const MAX_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 5;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      Object.assign(new Error('Only JPEG and PNG images are allowed'), {
        code: 'INVALID_FILE_TYPE',
      }),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});


const uploadReceiptMiddleware = (req, res, next) => {
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(
          res,
          'FILE_TOO_LARGE',
          `File exceeds the ${MAX_SIZE_MB}MB size limit`,
          400
        );
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return sendError(res, 'INVALID_FILE_TYPE', err.message, 400);
      }
      return sendError(res, 'UPLOAD_ERROR', 'File upload failed', 400);
    }

    if (!req.file) {
      return sendError(res, 'MISSING_FILE', 'A receipt image is required (field: receipt)', 400);
    }

    next();
  });
};

module.exports = { uploadReceiptMiddleware };
