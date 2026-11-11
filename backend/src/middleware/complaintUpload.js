
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDirectory = path.resolve(
  __dirname,
  "../../private_uploads/complaints"
);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 3;

// Allowed extensions and MIME types
const allowedTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf"
};

// Ensure private upload directory exists
fs.mkdirSync(uploadDirectory, { recursive: true });

// Remove uploaded files from disk
async function removeUploadedFiles(files = []) {
  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.promises.unlink(file.path);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("File cleanup failed:", error.message);
        }
      }
    })
  );
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const randomName = `${crypto.randomUUID()}${extension}`;

    callback(null, randomName);
  }
});

// Preliminary validation
function fileFilter(req, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();
  const expectedMime = allowedTypes[extension];

  if (!expectedMime || expectedMime !== file.mimetype) {
    return callback(
      new Error("Only JPG, JPEG, PNG, WEBP and PDF files are allowed.")
    );
  }

  callback(null, true);
}

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  }
});

// Validate actual file signatures
async function validateFileSignature(file) {
  const extension = path.extname(file.originalname).toLowerCase();

  const signatures = {
    ".jpg": {
      mime: "image/jpeg",
      bytes: [0xff, 0xd8, 0xff]
    },

    ".jpeg": {
      mime: "image/jpeg",
      bytes: [0xff, 0xd8, 0xff]
    },

    ".png": {
      mime: "image/png",
      bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    },

    ".webp": {
      mime: "image/webp",
      bytes: null
    },

    ".pdf": {
      mime: "application/pdf",
      bytes: [0x25, 0x50, 0x44, 0x46, 0x2d]
    }
  };

  const expected = signatures[extension];

  if (!expected || expected.mime !== file.mimetype) {
    return false;
  }

  const handle = await fs.promises.open(file.path, "r");

  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, 12, 0);

    if (extension === ".webp") {
      return (
        bytesRead >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    }

    const signature = expected.bytes;

    return (
      bytesRead >= signature.length &&
      signature.every((byte, index) => buffer[index] === byte)
    );
  } finally {
    await handle.close();
  }
}

// Main complaint upload middleware
function uploadComplaintAttachments(req, res, next) {
  upload.array("attachments", MAX_FILES)(req, res, async (error) => {
    if (error) {
      await removeUploadedFiles(req.files || []);

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Each attachment must be 5 MB or smaller."
          });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "You can upload a maximum of 3 attachments."
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    try {
      const files = req.files || [];

      for (const file of files) {
        const isValid = await validateFileSignature(file);

        if (!isValid) {
          await removeUploadedFiles(files);

          return res.status(400).json({
            success: false,
            message: `Invalid file content: ${file.originalname}`
          });
        }
      }

      next();
    } catch (validationError) {
      await removeUploadedFiles(req.files || []);

      console.error("Attachment validation error:", validationError);

      return res.status(500).json({
        success: false,
        message: "Failed to validate complaint attachments."
      });
    }
  });
}

module.exports = {
  uploadComplaintAttachments,
  removeUploadedFiles
};
