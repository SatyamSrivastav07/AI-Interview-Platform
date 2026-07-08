const express = require("express");
const { generateInterview } = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateInterview);

module.exports = router;
