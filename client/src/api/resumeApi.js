import api from "./axios.js";

export const uploadResume = (formData, onUploadProgress) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

export const getMyResume = () => api.get("/resume/me");
