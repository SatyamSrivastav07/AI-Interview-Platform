const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const { generateInterviewQuestions } = require("../services/interviewGenerator");

const allowedExperienceLevels = ["Fresher", "Junior", "Mid", "Senior"];
const allowedInterviewTypes = ["HR", "Technical", "DSA", "Mixed"];
const allowedDifficulties = ["Easy", "Medium", "Hard"];

const validateGenerateInterviewInput = ({
  resumeId,
  role,
  experienceLevel,
  interviewType,
  difficulty,
  numberOfQuestions,
}) => {
  if (!resumeId || !role || !experienceLevel || !interviewType || !difficulty || !numberOfQuestions) {
    return "resumeId, role, experienceLevel, interviewType, difficulty, and numberOfQuestions are required";
  }

  if (!allowedExperienceLevels.includes(experienceLevel)) {
    return "experienceLevel must be one of: Fresher, Junior, Mid, Senior";
  }

  if (!allowedInterviewTypes.includes(interviewType)) {
    return "interviewType must be one of: HR, Technical, DSA, Mixed";
  }

  if (!allowedDifficulties.includes(difficulty)) {
    return "difficulty must be one of: Easy, Medium, Hard";
  }

  const parsedQuestionCount = Number.parseInt(numberOfQuestions, 10);

  if (Number.isNaN(parsedQuestionCount) || parsedQuestionCount < 1 || parsedQuestionCount > 30) {
    return "numberOfQuestions must be a number between 1 and 30";
  }

  return null;
};

// Creates a saved interview question set for the authenticated user.
const generateInterview = async (req, res, next) => {
  try {
    const { resumeId, role, experienceLevel, interviewType, difficulty, numberOfQuestions } = req.body;
    const validationError = validateGenerateInterviewInput({
      resumeId,
      role,
      experienceLevel,
      interviewType,
      difficulty,
      numberOfQuestions,
    });

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    });

    if (!resume) {
      res.status(404);
      throw new Error("Resume not found");
    }

    const generationResult = await generateInterviewQuestions({
      resume,
      role: role.trim(),
      experienceLevel,
      interviewType,
      difficulty,
      numberOfQuestions,
    });

    const interview = await Interview.create({
      user: req.user._id,
      resume: resume._id,
      role: role.trim(),
      experienceLevel,
      interviewType,
      difficulty,
      questions: generationResult.questions,
    });

    const response = {
      success: true,
      message: "Interview questions generated successfully",
      generationProvider: generationResult.provider,
      interview,
    };

    if (generationResult.warning) {
      response.generationWarning = generationResult.warning;
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInterview,
};
