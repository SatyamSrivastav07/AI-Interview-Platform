const express = require("express");
const {
  uploadResume,
  getMyResume,
  deleteResume,
} = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");
const { handleResumeUpload } = require("../config/multer");

const router = express.Router();

router.post("/upload", protect, handleResumeUpload, uploadResume);
router.get("/me", protect, getMyResume);
router.delete("/delete", protect, deleteResume);

module.exports = router;
