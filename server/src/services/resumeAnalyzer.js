const sectionAliases = {
  education: ["education", "academic background", "academics", "qualification", "qualifications"],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "career history",
  ],
  projects: ["projects", "project experience", "academic projects", "personal projects"],
  certifications: ["certifications", "certification", "licenses", "achievements"],
  skills: ["skills", "technical skills", "core skills", "key skills"],
};

const keywordGroups = {
  programmingLanguages: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C",
    "C++",
    "C#",
    "Go",
    "Golang",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
    "Rust",
    "Dart",
    "Scala",
    "R",
    "SQL",
    "HTML",
    "CSS",
  ],
  frameworks: [
    "React",
    "Next.js",
    "Angular",
    "Vue",
    "Express",
    "Node.js",
    "NestJS",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    "Laravel",
    "Rails",
    "Tailwind CSS",
    "Bootstrap",
    "Redux",
  ],
  databases: [
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "SQLite",
    "Redis",
    "Firebase",
    "DynamoDB",
    "Oracle",
    "MariaDB",
    "Elasticsearch",
  ],
  tools: [
    "Git",
    "GitHub",
    "GitLab",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Postman",
    "Jira",
    "Figma",
    "VS Code",
    "Linux",
    "Webpack",
    "Vite",
    "NPM",
  ],
};

// Escapes dynamic keyword text before building a regular expression.
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Normalizes spacing while keeping lines useful for section-based parsing.
const normalizeText = (text) =>
  (text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

// Removes duplicates while preserving the first readable casing we found.
const uniqueValues = (values) => {
  const seen = new Set();

  return values.filter((value) => {
    const normalized = value.toLowerCase();

    if (!value || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

// Checks a resume for known technical keywords in a category.
const findKeywords = (text, keywords) =>
  keywords.filter((keyword) => {
    const pattern = new RegExp(`(^|[^a-zA-Z0-9+#.])${escapeRegExp(keyword)}([^a-zA-Z0-9+#.]|$)`, "i");
    return pattern.test(text);
  });

const isSectionHeading = (line) => {
  const normalizedLine = line.toLowerCase().replace(/[:\-]/g, "").trim();
  const allHeadings = Object.values(sectionAliases).flat();

  return allHeadings.some((heading) => normalizedLine === heading);
};

// Extracts text lines that appear below a known section heading until the next known heading.
const extractSectionLines = (lines, sectionName) => {
  const aliases = sectionAliases[sectionName] || [];
  const collected = [];
  let isInsideSection = false;

  for (const line of lines) {
    const normalizedLine = line.toLowerCase().replace(/[:\-]/g, "").trim();
    const startsTargetSection = aliases.some((alias) => normalizedLine === alias);

    if (startsTargetSection) {
      isInsideSection = true;
      continue;
    }

    if (isInsideSection && isSectionHeading(line)) {
      break;
    }

    if (isInsideSection) {
      collected.push(line);
    }
  }

  return collected;
};

// Converts section lines into readable list items by splitting common resume separators.
const extractListItems = (lines) =>
  uniqueValues(
    lines
      .flatMap((line) => line.split(/[,;|•]/))
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter((item) => item.length >= 2)
  );

// Finds likely certifications even if the resume does not have a dedicated certification section.
const inferCertifications = (lines) =>
  lines.filter((line) => /\b(certified|certification|certificate|licensed|aws certified|google certified)\b/i.test(line));

// Returns a structured, rule-based summary of parsed resume information.
const analyzeResume = (extractedText) => {
  const normalizedText = normalizeText(extractedText);
  const lines = normalizedText.split("\n").filter(Boolean);

  const educationLines = extractSectionLines(lines, "education");
  const experienceLines = extractSectionLines(lines, "experience");
  const projectLines = extractSectionLines(lines, "projects");
  const certificationLines = extractSectionLines(lines, "certifications");
  const skillSectionItems = extractListItems(extractSectionLines(lines, "skills"));

  const programmingLanguages = findKeywords(normalizedText, keywordGroups.programmingLanguages);
  const frameworks = findKeywords(normalizedText, keywordGroups.frameworks);
  const databases = findKeywords(normalizedText, keywordGroups.databases);
  const tools = findKeywords(normalizedText, keywordGroups.tools);

  // The skills array intentionally combines explicit skill-section items with categorized keywords.
  // A future Gemini analyzer can keep this response shape and simply improve the extraction quality.
  const skills = uniqueValues([
    ...skillSectionItems,
    ...programmingLanguages,
    ...frameworks,
    ...databases,
    ...tools,
  ]);

  return {
    skills,
    education: educationLines.join("\n"),
    experience: experienceLines.join("\n"),
    projects: extractListItems(projectLines),
    certifications: uniqueValues([...extractListItems(certificationLines), ...inferCertifications(lines)]),
    programmingLanguages,
    frameworks,
    databases,
    tools,
  };
};

module.exports = {
  analyzeResume,
};
