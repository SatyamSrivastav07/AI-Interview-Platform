import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GenerateInterview from "./pages/GenerateInterview.jsx";
import InterviewHistory from "./pages/InterviewHistory.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Register from "./pages/Register.jsx";
import ResumeUpload from "./pages/ResumeUpload.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/resume" element={<ResumeUpload />} />
      <Route path="/generate-interview" element={<GenerateInterview />} />
      <Route path="/history" element={<InterviewHistory />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
