const geminiModelName = "gemini-2.5-flash";
const geminiSdkMethod = "ai.models.generateContent";

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

const normalizeScore = (score) => {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(numericScore), 0), 100);
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

// Extracts JSON even when Gemini wraps its response in markdown fences.
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

const buildResumeContext = (resume) => ({
  skills: resume?.skills || [],
  strengths: resume?.strengths || [],
  weakAreas: resume?.weakAreas || [],
  projects: resume?.projects || [],
  programmingLanguages: resume?.programmingLanguages || [],
  frameworks: resume?.frameworks || [],
  databases: resume?.databases || [],
  tools: resume?.tools || [],
  suggestedInterviewTopics: resume?.suggestedInterviewTopics || [],
});

const normalizeEvaluation = (evaluation) => ({
  score: normalizeScore(evaluation?.score),
  feedback: normalizeString(evaluation?.feedback),
  strengths: normalizeStringArray(evaluation?.strengths),
  improvements: normalizeStringArray(evaluation?.improvements),
  idealAnswer: normalizeString(evaluation?.idealAnswer),
});

const evaluateWithGemini = async ({ question, expectedTopics, userAnswer, resume }) => {
  const ai = await getGeminiClient();
  const resumeContext = buildResumeContext(resume);

  console.info("[Gemini Answer Evaluator] Request started", {
    model: geminiModelName,
    sdkMethod: geminiSdkMethod,
    questionId: question.id,
    category: question.category,
    difficulty: question.difficulty,
    answerLength: userAnswer.length,
  });

  const prompt = `
You are an expert interview evaluator.
Evaluate the candidate answer against the interview question, expected topics, and resume context.

Rules:
- Return JSON only.
- Do not include markdown, commentary, or explanations.
- Score must be an integer from 0 to 100.
- Be fair, concise, and actionable.
- Do not invent details not present in the answer or resume.

Return this exact JSON shape:
{
  "score": 0,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  "idealAnswer": ""
}

Question:
${question.question}

Category: ${question.category}
Difficulty: ${question.difficulty}
Expected Topics:
${JSON.stringify(expectedTopics)}

Candidate Answer:
${userAnswer}

Resume Context:
${JSON.stringify(resumeContext)}
`;

  const response = await ai.models.generateContent({
    model: geminiModelName,
    contents: prompt,
  });

  console.info("[Gemini Answer Evaluator] Response received", {
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
  const parsedEvaluation = extractJsonObject(rawText);

  return normalizeEvaluation(parsedEvaluation);
};

const evaluateRuleBased = ({ expectedTopics, userAnswer }) => {
  const answer = normalizeString(userAnswer);
  const lowerAnswer = answer.toLowerCase();
  const topics = normalizeStringArray(expectedTopics);
  const coveredTopics = topics.filter((topic) => lowerAnswer.includes(topic.toLowerCase()));
  const answerLengthScore = Math.min(Math.floor(answer.length / 8), 45);
  const topicScore = topics.length > 0 ? Math.round((coveredTopics.length / topics.length) * 45) : 25;
  const clarityScore = /because|therefore|for example|trade-off|complexity|impact/i.test(answer) ? 10 : 5;
  const score = normalizeScore(answerLengthScore + topicScore + clarityScore);

  return {
    score,
    feedback:
      score >= 75
        ? "Good answer with relevant detail. Add measurable impact or trade-offs to make it stronger."
        : "The answer needs more depth, clearer structure, and stronger coverage of the expected topics.",
    strengths: coveredTopics.length > 0 ? [`Covered: ${coveredTopics.join(", ")}`] : ["Attempted the question"],
    improvements:
      coveredTopics.length > 0
        ? ["Add concrete examples", "Explain trade-offs and outcomes"]
        : ["Address the expected topics directly", "Use a structured example from your resume"],
    idealAnswer:
      topics.length > 0
        ? `A strong answer should clearly cover ${topics.join(", ")}, include a concrete example, explain trade-offs, and describe the final impact.`
        : "A strong answer should include a concrete example, clear reasoning, trade-offs, and measurable impact.",
  };
};

// Evaluates an answer with Gemini first and falls back to a deterministic local evaluator.
const evaluateAnswer = async ({ question, expectedTopics, userAnswer, resume }) => {
  try {
    const evaluation = await evaluateWithGemini({ question, expectedTopics, userAnswer, resume });

    return {
      evaluation,
      provider: "gemini",
      warning: null,
    };
  } catch (error) {
    console.error("[Gemini Answer Evaluator] Request failed", getSafeErrorDetails(error));

    return {
      evaluation: evaluateRuleBased({ expectedTopics, userAnswer }),
      provider: "rule-based",
      warning: "Gemini answer evaluation failed, so rule-based feedback was used",
    };
  }
};

module.exports = {
  evaluateAnswer,
};
