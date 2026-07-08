const express = require("express");
const { generateInterview, submitAnswer } = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateInterview);
router.post("/:interviewId/answer", protect, submitAnswer);

module.exports = router;
