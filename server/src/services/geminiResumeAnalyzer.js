const defaultAnalysis = {
  skills: [],
  education: "",
  experience: "",
  projects: [],
  certifications: [],
  programmingLanguages: [],
  frameworks: [],
  databases: [],
  tools: [],
  strengths: [],
  weakAreas: [],
  suggestedInterviewTopics: [],
};

const jsonSchemaDescription = `
Return only valid JSON with this exact shape:
{
  "skills": [],
  "education": "",
  "experience": "",
  "projects": [],
  "certifications": [],
  "programmingLanguages": [],
  "frameworks": [],
  "databases": [],
  "tools": [],
  "strengths": [],
  "weakAreas": [],
  "suggestedInterviewTopics": []
}
`;

const geminiModelName = "gemini-2.5-flash";
const geminiSdkMethod = "ai.models.generateContent";

const getSafeErrorDetails = (error) => ({
  message: error?.message,
  status: error?.status,
  statusCode: error?.statusCode,
  code: error?.code,
  responseStatus: error?.response?.status,
  responseStatusText: error?.response?.statusText,
  responseErrorMessage: error?.response?.data?.error?.message || error?.error?.message,
});

const logGeminiError = (error) => {
  console.error("[Gemini Resume Analyzer] Request failed", getSafeErrorDetails(error));
};

// Keeps Gemini optional: missing API keys should trigger fallback instead of breaking uploads.
const getGeminiClient = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const { GoogleGenAI } = await import("@google/genai");

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// Extracts a JSON object from the model response, including responses wrapped in markdown fences.
const extractJsonObject = (responseText) => {
  const trimmedText = (responseText || "").trim();
  const fencedMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch ? fencedMatch[1].trim() : trimmedText;
  const objectStart = jsonText.indexOf("{");
  const objectEnd = jsonText.lastIndexOf("}");

  if (objectStart === -1 || objectEnd === -1 || objectEnd <= objectStart) {
    throw new Error("Gemini response did not contain a JSON object");
  }

  return JSON.parse(jsonText.slice(objectStart, objectEnd + 1));
};

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => {
      const normalized = item.toLowerCase();

      if (!item || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
};

// Normalizes untrusted model output into the shape expected by the Resume model.
const normalizeGeminiAnalysis = (analysis) => ({
  ...defaultAnalysis,
  skills: normalizeStringArray(analysis.skills),
  education: normalizeString(analysis.education),
  experience: normalizeString(analysis.experience),
  projects: normalizeStringArray(analysis.projects),
  certifications: normalizeStringArray(analysis.certifications),
  programmingLanguages: normalizeStringArray(analysis.programmingLanguages),
  frameworks: normalizeStringArray(analysis.frameworks),
  databases: normalizeStringArray(analysis.databases),
  tools: normalizeStringArray(analysis.tools),
  strengths: normalizeStringArray(analysis.strengths),
  weakAreas: normalizeStringArray(analysis.weakAreas),
  suggestedInterviewTopics: normalizeStringArray(analysis.suggestedInterviewTopics),
});

// Sends extracted resume text to Gemini and returns structured resume intelligence.
const analyzeResumeWithGemini = async (extractedText) => {
  const resumeText = normalizeString(extractedText);

  if (!resumeText) {
    throw new Error("Extracted resume text is required for Gemini analysis");
  }

  console.info("[Gemini Resume Analyzer] Request started", {
    model: geminiModelName,
    sdkMethod: geminiSdkMethod,
    textLength: resumeText.length,
  });

  try {
    const ai = await getGeminiClient();
    const prompt = `
You are an expert technical recruiter and resume analyst.
Analyze the resume text and extract structured information for interview preparation.

Rules:
- Return JSON only.
- Do not include markdown, commentary, or explanations.
- Use empty arrays or empty strings when information is missing.
- Keep entries concise and candidate-specific.
- Do not invent details that are not supported by the resume text.

${jsonSchemaDescription}

Resume text:
${resumeText}
`;

    const response = await ai.models.generateContent({
      model: geminiModelName,
      contents: prompt,
    });

    console.info("[Gemini Resume Analyzer] Response received", {
      status: response.sdkHttpResponse?.status,
      model: response.modelVersion || response.modelStatus?.model,
      responseId: response.responseId,
      candidateCount: response.candidates?.length || 0,
      promptBlockReason: response.promptFeedback?.blockReason,
      finishReason: response.candidates?.[0]?.finishReason,
    });

    const rawText =
      typeof response.text === "function"
        ? response.text()
        : response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedAnalysis = extractJsonObject(rawText);

    return normalizeGeminiAnalysis(parsedAnalysis);
  } catch (error) {
    logGeminiError(error);
    throw error;
  }
};

module.exports = {
  analyzeResumeWithGemini,
};
