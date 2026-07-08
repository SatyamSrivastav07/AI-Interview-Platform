const fs = require("fs/promises");
const path = require("path");
const Resume = require("../models/Resume");
const { resumesUploadDir } = require("../config/multer");
const { parseResume } = require("../services/resumeParser");
const { analyzeResume } = require("../services/resumeAnalyzer");
const { analyzeResumeWithGemini } = require("../services/geminiResumeAnalyzer");

const removeStoredFile = async (storedFileName) => {
  if (!storedFileName) {
    return;
  }

  const filePath = path.join(resumesUploadDir, storedFileName);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const buildResumeResponse = (resume) => ({
  id: resume._id,
  user: resume.user,
  originalFileName: resume.originalFileName,
  storedFileName: resume.storedFileName,
  fileUrl: resume.fileUrl,
  fileSize: resume.fileSize,
  uploadDate: resume.uploadDate,
  extractedText: resume.extractedText,
  skills: resume.skills,
  experience: resume.experience,
  education: resume.education,
  projects: resume.projects,
  certifications: resume.certifications,
  programmingLanguages: resume.programmingLanguages,
  frameworks: resume.frameworks,
  databases: resume.databases,
  tools: resume.tools,
  strengths: resume.strengths,
  weakAreas: resume.weakAreas,
  suggestedInterviewTopics: resume.suggestedInterviewTopics,
});

// Runs Gemini first and falls back to the local rule-based analyzer if Gemini is unavailable.
const analyzeResumeWithFallback = async (extractedText) => {
  try {
    const analysis = await analyzeResumeWithGemini(extractedText);

    return {
      analysis,
      usedFallback: false,
      warning: null,
    };
  } catch (error) {
    console.error("Gemini resume analysis failed:", error.message);

    return {
      analysis: {
        ...analyzeResume(extractedText),
        strengths: [],
        weakAreas: [],
        suggestedInterviewTopics: [],
      },
      usedFallback: true,
      warning: "Gemini analysis failed, so rule-based resume analysis was used",
    };
  }
};

// Stores a new authenticated user's resume and replaces any previous resume.
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Resume file is required");
    }

    const existingResume = await Resume.findOne({ user: req.user._id });

    if (existingResume) {
      await removeStoredFile(existingResume.storedFileName);
      await existingResume.deleteOne();
    }

    let extractedText = "";
    let parsingWarning = null;

    try {
      extractedText = await parseResume(req.file.path, req.file.mimetype);
    } catch (parseError) {
      parsingWarning = "Resume uploaded, but text extraction failed";
      console.error("Resume parsing failed:", parseError.message);
    }

    const {
      analysis: analyzedResume,
      usedFallback: usedRuleBasedAnalysis,
      warning: analysisWarning,
    } = await analyzeResumeWithFallback(extractedText);

    const resume = await Resume.create({
      user: req.user._id,
      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileSize: req.file.size,
      uploadDate: new Date(),
      extractedText,
      skills: analyzedResume.skills,
      experience: analyzedResume.experience,
      education: analyzedResume.education,
      projects: analyzedResume.projects,
      certifications: analyzedResume.certifications,
      programmingLanguages: analyzedResume.programmingLanguages,
      frameworks: analyzedResume.frameworks,
      databases: analyzedResume.databases,
      tools: analyzedResume.tools,
      strengths: analyzedResume.strengths,
      weakAreas: analyzedResume.weakAreas,
      suggestedInterviewTopics: analyzedResume.suggestedInterviewTopics,
    });

    const response = {
      success: true,
      message: parsingWarning || "Resume uploaded and parsed successfully",
      resume: buildResumeResponse(resume),
    };

    if (parsingWarning) {
      response.warning = parsingWarning;
    }

    if (analysisWarning) {
      response.analysisWarning = analysisWarning;
      response.analysisProvider = usedRuleBasedAnalysis ? "rule-based" : "gemini";
    } else {
      response.analysisProvider = "gemini";
    }

    res.status(201).json(response);
  } catch (error) {
    if (req.file) {
      try {
        await removeStoredFile(req.file.filename);
      } catch (cleanupError) {
        console.error("Failed to remove uploaded resume after error:", cleanupError.message);
      }
    }
    next(error);
  }
};

// Returns the resume owned by the currently authenticated user.
const getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error("Resume not found");
    }

    res.status(200).json({
      success: true,
      resume: buildResumeResponse(resume),
    });
  } catch (error) {
    next(error);
  }
};

// Deletes the current user's resume record and removes the stored file.
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error("Resume not found");
    }

    await removeStoredFile(resume.storedFileName);
    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getMyResume,
  deleteResume,
};
