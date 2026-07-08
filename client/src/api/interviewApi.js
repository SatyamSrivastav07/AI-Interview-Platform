import api from "./axios.js";

export const getInterviewStats = () => api.get("/interview/stats");

export const getInterviewHistory = () => api.get("/interview/history");

export const generateInterview = (payload) => api.post("/interview/generate", payload);

export const getInterview = (interviewId) => api.get(`/interview/${interviewId}`);

export const submitAnswer = (interviewId, payload) => api.post(`/interview/${interviewId}/answer`, payload);

export const deleteInterview = (interviewId) => api.delete(`/interview/${interviewId}`);
