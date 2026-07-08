const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const { generateInterviewQuestions } = require("../services/interviewGenerator");
const { evaluateAnswer } = require("../services/answerEvaluator");

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

const validateSubmitAnswerInput = ({ questionId, userAnswer }) => {
  const parsedQuestionId = Number.parseInt(questionId, 10);

  if (Number.isNaN(parsedQuestionId)) {
    return "questionId must be a valid number";
  }

  if (!userAnswer || typeof userAnswer !== "string" || !userAnswer.trim()) {
    return "userAnswer is required";
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

// Evaluates and saves an answer for one question in an authenticated user's interview.
const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { questionId, userAnswer } = req.body;
    const validationError = validateSubmitAnswerInput({ questionId, userAnswer });

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      res.status(404);
      throw new Error("Interview not found");
    }

    const parsedQuestionId = Number.parseInt(questionId, 10);
    const question = interview.questions.find((item) => item.id === parsedQuestionId);

    if (!question) {
      res.status(404);
      throw new Error("Question not found");
    }

    const resume = await Resume.findOne({
      _id: interview.resume,
      user: req.user._id,
    });

    if (!resume) {
      res.status(404);
      throw new Error("Resume not found");
    }

    const evaluationResult = await evaluateAnswer({
      question,
      expectedTopics: question.expectedTopics,
      userAnswer: userAnswer.trim(),
      resume,
    });

    question.userAnswer = userAnswer.trim();
    question.feedback = evaluationResult.evaluation.feedback;
    question.score = evaluationResult.evaluation.score;
    question.strengths = evaluationResult.evaluation.strengths;
    question.improvements = evaluationResult.evaluation.improvements;

    await interview.save();

    const response = {
      success: true,
      message: "Answer evaluated successfully",
      evaluationProvider: evaluationResult.provider,
      question: {
        id: question.id,
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        expectedTopics: question.expectedTopics,
        userAnswer: question.userAnswer,
        feedback: question.feedback,
        score: question.score,
        strengths: question.strengths,
        improvements: question.improvements,
        idealAnswer: evaluationResult.evaluation.idealAnswer,
      },
    };

    if (evaluationResult.warning) {
      response.evaluationWarning = evaluationResult.warning;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInterview,
  submitAnswer,
};
