const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure the uploads directory exists

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Export the upload function
exports.upload = multer({ storage: storage });
