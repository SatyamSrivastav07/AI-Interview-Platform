const fs = require("fs/promises");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const pdfMimeType = "application/pdf";
const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Cleans parser output while keeping meaningful paragraph and section breaks.
const cleanExtractedText = (text) => {
  if (!text) {
    return "";
  }

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Extracts raw text from supported resume files and returns normalized text.
const parseResume = async (filePath, mimeType) => {
  if (!filePath) {
    throw new Error("Resume file path is required");
  }

  if (mimeType === pdfMimeType) {
    const fileBuffer = await fs.readFile(filePath);
    const parsedPdf = await pdfParse(fileBuffer);
    return cleanExtractedText(parsedPdf.text);
  }

  if (mimeType === docxMimeType) {
    const parsedDocx = await mammoth.extractRawText({ path: filePath });
    return cleanExtractedText(parsedDocx.value);
  }

  throw new Error("Unsupported resume file type");
};

module.exports = {
  parseResume,
};
