const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
