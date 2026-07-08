const fs = require("fs");
const path = require("path");
const multer = require("multer");

const resumesUploadDir = path.join(__dirname, "../../uploads/resumes");
const maxResumeSize = 10 * 1024 * 1024;
const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const allowedExtensions = [".pdf", ".docx"];

fs.mkdirSync(resumesUploadDir, { recursive: true });

// Converts the original name into a filesystem-safe base name.
const sanitizeFileName = (fileName) =>
  path
    .parse(fileName)
    .name.replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "resume";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesUploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = sanitizeFileName(file.originalname);
    const uniqueSuffix = `${req.user._id}-${Date.now()}`;

    cb(null, `${safeName}-${uniqueSuffix}${extension}`);
  },
});

// Validates both MIME type and extension so renamed executables are rejected.
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const hasAllowedMimeType = allowedMimeTypes.includes(file.mimetype);
  const hasAllowedExtension = allowedExtensions.includes(extension);

  if (!hasAllowedMimeType || !hasAllowedExtension) {
    return cb(new Error("Only PDF and DOCX resume files are allowed"));
  }

  return cb(null, true);
};

const uploadResumeFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxResumeSize,
  },
});

// Runs the Multer upload and normalizes upload errors for the API response.
const handleResumeUpload = (req, res, next) => {
  uploadResumeFile.single("resume")(req, res, (error) => {
    if (!error) {
      return next();
    }

    res.status(400);

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new Error("Resume file cannot exceed 10MB"));
    }

    return next(error);
  });
};

module.exports = {
  handleResumeUpload,
  resumesUploadDir,
};
