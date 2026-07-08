import api from "./axios.js";

export const loginUser = (credentials) => api.post("/auth/login", credentials);

export const registerUser = (payload) => api.post("/auth/register", payload);
