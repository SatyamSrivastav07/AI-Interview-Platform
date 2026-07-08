import api from "./axios.js";

export const getInterviewStats = () => api.get("/interview/stats");

export const getInterviewHistory = () => api.get("/interview/history");

export const generateInterview = (payload) => api.post("/interview/generate", payload);
