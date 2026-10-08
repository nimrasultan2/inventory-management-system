'use strict';

const path = require('path');
const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Store files in server/uploads/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(
      null,
      path.join(__dirname, '..', '..', 'uploads')
    );
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const unique =
      `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;

    cb(null, unique);
  }
});

function fileFilter(req, file, cb) {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const validMimeType = ALLOWED_MIME_TYPES.has(
    file.mimetype
  );

  const validExtension = ALLOWED_EXTENSIONS.has(
    extension
  );

  if (validMimeType && validExtension) {
    return cb(null, true);
  }

  const err = new Error(
    'Only jpg, jpeg, png, and webp images are allowed'
  );

  err.status = 400;

  return cb(err, false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  }
});

module.exports = {
  upload
};