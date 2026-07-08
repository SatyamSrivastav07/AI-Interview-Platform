const express = require("express");
const {
  generateInterview,
  getInterviewHistory,
  getInterviewById,
  deleteInterview,
  getInterviewStats,
  submitAnswer,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateInterview);
router.get("/history", protect, getInterviewHistory);
router.get("/stats", protect, getInterviewStats);
router.get("/:interviewId", protect, getInterviewById);
router.delete("/:interviewId", protect, deleteInterview);
router.post("/:interviewId/answer", protect, submitAnswer);

module.exports = router;
