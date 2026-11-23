
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const uploadDirectory = path.resolve(__dirname, "../../uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const expectedMimeType = allowedTypes[extension];

    if (!expectedMimeType || file.mimetype !== expectedMimeType) {
      return cb(
        new Error("Only JPG, JPEG, PNG and WEBP images are allowed.")
      );
    }

    cb(null, true);
  }
});

function handleUploadError(uploadMiddleware, fieldName) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (error) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? "Each image must be 5 MB or smaller."
            : error.code === "LIMIT_FILE_COUNT"
              ? "You can upload a maximum of 3 images."
              : error.code === "LIMIT_UNEXPECTED_FILE"
                ? "Unexpected image field or too many images."
                : error.message || "Image upload failed.";

        return res.status(400).json({
          success: false,
          message
        });
      }

      if (fieldName === "image" && req.file) {
        req.body.image_url = `/uploads/${req.file.filename}`;
      }

      if (fieldName === "logo" && req.file) {
        req.body.logo_url = `/uploads/${req.file.filename}`;
      }

      if (fieldName === "images" && req.files) {
        req.body.image_urls = req.files.map(
          (file) => `/uploads/${file.filename}`
        );
      }

      next();
    });
  };
}

const uploadSingleImage = handleUploadError(
  upload.single("image"),
  "image"
);

const uploadShopLogo = handleUploadError(
  upload.single("image"),
  "logo"
);

const uploadReviewImages = handleUploadError(
  upload.array("images", 3),
  "images"
);

module.exports = {
  uploadSingleImage,
  uploadShopLogo,
  uploadReviewImages
};
