const geminiModelName = "gemini-2.5-flash";
const geminiSdkMethod = "ai.models.generateContent";

const allowedCategories = ["HR", "Technical", "DSA", "Mixed"];
const allowedDifficulties = ["Easy", "Medium", "Hard"];

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();

  return value
    .map((item) => normalizeString(item))
    .filter((item) => {
      const normalized = item.toLowerCase();

      if (!item || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
};

const clampQuestionCount = (numberOfQuestions) => {
  const parsedCount = Number.parseInt(numberOfQuestions, 10);

  if (Number.isNaN(parsedCount)) {
    return 10;
  }

  return Math.min(Math.max(parsedCount, 1), 30);
};

const getSafeErrorDetails = (error) => ({
  message: error?.message,
  status: error?.status,
  statusCode: error?.statusCode,
  code: error?.code,
  responseStatus: error?.response?.status,
  responseStatusText: error?.response?.statusText,
  responseErrorMessage: error?.response?.data?.error?.message || error?.error?.message,
});

const getGeminiClient = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const { GoogleGenAI } = await import("@google/genai");

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// Extracts JSON even when the model wraps it in markdown fences.
const extractJsonObject = (responseText) => {
  const trimmedText = normalizeString(responseText);
  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch ? fencedMatch[1].trim() : trimmedText;
  const objectStart = jsonText.indexOf("{");
  const objectEnd = jsonText.lastIndexOf("}");

  if (objectStart === -1 || objectEnd === -1 || objectEnd <= objectStart) {
    throw new Error("Gemini response did not contain a JSON object");
  }

  return JSON.parse(jsonText.slice(objectStart, objectEnd + 1));
};

const normalizeQuestion = (question, index, fallbackDifficulty) => ({
  id: Number.isInteger(question?.id) ? question.id : index + 1,
  question: normalizeString(question?.question),
  category: allowedCategories.includes(question?.category) ? question.category : "Mixed",
  difficulty: allowedDifficulties.includes(question?.difficulty) ? question.difficulty : fallbackDifficulty,
  expectedTopics: normalizeStringArray(question?.expectedTopics),
});

const normalizeQuestions = (questions, count, difficulty) =>
  (Array.isArray(questions) ? questions : [])
    .map((question, index) => normalizeQuestion(question, index, difficulty))
    .filter((question) => question.question)
    .slice(0, count);

const buildResumeContext = (resume) => ({
  extractedText: resume.extractedText,
  skills: resume.skills,
  strengths: resume.strengths,
  weakAreas: resume.weakAreas,
  projects: resume.projects,
  certifications: resume.certifications,
  programmingLanguages: resume.programmingLanguages,
  frameworks: resume.frameworks,
  databases: resume.databases,
  tools: resume.tools,
  suggestedInterviewTopics: resume.suggestedInterviewTopics,
});

const generateGeminiQuestions = async ({ resume, role, experienceLevel, interviewType, difficulty, numberOfQuestions }) => {
  const count = clampQuestionCount(numberOfQuestions);
  const resumeContext = buildResumeContext(resume);
  const ai = await getGeminiClient();

  console.info("[Gemini Interview Generator] Request started", {
    model: geminiModelName,
    sdkMethod: geminiSdkMethod,
    role,
    experienceLevel,
    interviewType,
    difficulty,
    numberOfQuestions: count,
  });

  const prompt = `
You are a senior interviewer creating candidate-specific interview questions.
Use the resume analysis and target role to generate interview questions.

Rules:
- Return JSON only.
- Do not include markdown, commentary, or explanations.
- Generate exactly ${count} questions.
- Each question must be specific, interview-ready, and relevant to the resume.
- Match the requested interview type and difficulty.
- Do not invent candidate experience not supported by the resume.

Return this exact JSON shape:
{
  "questions": [
    {
      "id": 1,
      "question": "",
      "category": "HR | Technical | DSA | Mixed",
      "difficulty": "Easy | Medium | Hard",
      "expectedTopics": []
    }
  ]
}

Request:
Role: ${role}
Experience Level: ${experienceLevel}
Interview Type: ${interviewType}
Difficulty: ${difficulty}

Resume Analysis:
${JSON.stringify(resumeContext)}
`;

  const response = await ai.models.generateContent({
    model: geminiModelName,
    contents: prompt,
  });

  console.info("[Gemini Interview Generator] Response received", {
    status: response.sdkHttpResponse?.status,
    responseId: response.responseId,
    candidateCount: response.candidates?.length || 0,
    promptBlockReason: response.promptFeedback?.blockReason,
    finishReason: response.candidates?.[0]?.finishReason,
  });

  const rawText =
    typeof response.text === "function"
      ? response.text()
      : response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsedResponse = extractJsonObject(rawText);
  const questions = normalizeQuestions(parsedResponse.questions, count, difficulty);

  if (questions.length === 0) {
    throw new Error("Gemini did not return usable interview questions");
  }

  return questions;
};

const getResumeTopicPool = (resume) =>
  normalizeStringArray([
    ...(resume.skills || []),
    ...(resume.programmingLanguages || []),
    ...(resume.frameworks || []),
    ...(resume.databases || []),
    ...(resume.tools || []),
    ...(resume.projects || []),
    ...(resume.weakAreas || []),
    ...(resume.suggestedInterviewTopics || []),
  ]);

const buildRuleBasedQuestion = ({ id, topic, role, experienceLevel, interviewType, difficulty }) => {
  const category = interviewType === "Mixed" ? (id % 3 === 0 ? "HR" : id % 2 === 0 ? "DSA" : "Technical") : interviewType;

  if (category === "HR") {
    return {
      id,
      question: `Tell me about a resume project where you used ${topic}. What was your role, and what impact did you create?`,
      category,
      difficulty,
      expectedTopics: [topic, "communication", "ownership"],
    };
  }

  if (category === "DSA") {
    return {
      id,
      question: `For a ${role} ${experienceLevel} candidate, explain how you would solve a problem involving ${topic} with efficient data structures.`,
      category,
      difficulty,
      expectedTopics: [topic, "data structures", "time complexity"],
    };
  }

  return {
    id,
    question: `How would you apply ${topic} in a ${role} role, and what trade-offs would you consider?`,
    category,
    difficulty,
    expectedTopics: [topic, role, "trade-offs"],
  };
};

const generateRuleBasedQuestions = ({ resume, role, experienceLevel, interviewType, difficulty, numberOfQuestions }) => {
  const count = clampQuestionCount(numberOfQuestions);
  const topicPool = getResumeTopicPool(resume);
  const fallbackTopics = topicPool.length > 0 ? topicPool : [role, "resume projects", "problem solving", "team collaboration"];

  return Array.from({ length: count }, (_, index) =>
    buildRuleBasedQuestion({
      id: index + 1,
      topic: fallbackTopics[index % fallbackTopics.length],
      role,
      experienceLevel,
      interviewType,
      difficulty,
    })
  );
};

// Generates interview questions with Gemini first, then falls back to deterministic local questions.
const generateInterviewQuestions = async (options) => {
  try {
    const questions = await generateGeminiQuestions(options);

    return {
      questions,
      provider: "gemini",
      warning: null,
    };
  } catch (error) {
    console.error("[Gemini Interview Generator] Request failed", getSafeErrorDetails(error));

    return {
      questions: generateRuleBasedQuestions(options),
      provider: "rule-based",
      warning: "Gemini question generation failed, so rule-based questions were used",
    };
  }
};

module.exports = {
  generateInterviewQuestions,
};
