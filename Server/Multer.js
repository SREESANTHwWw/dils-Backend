const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Define the upload directory path
const uploadDir = path.join(__dirname, "uploads");

// Ensure the uploads directory exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.error("Error creating uploads directory:", err);
  process.exit(1); // Exit process if directory creation fails
}

// Allowed file types
const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${basename}${ext}`);
  },
});

// File filter for MIME type validation
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: fileFilter,
});

module.exports = upload; // Export multer configuration
