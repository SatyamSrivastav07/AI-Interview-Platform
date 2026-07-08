import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Navbar from "../components/Navbar.jsx";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Choose a resume file first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);

    try {
      await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume uploaded successfully");
      setFile(null);
      event.target.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Resume upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Resume</p>
          <h1 className="mt-3 text-3xl font-bold text-ink">Upload Resume</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Upload a PDF or DOCX resume. The backend will extract text and prepare structured information for interview
            generation.
          </p>
        </section>

        <section className="panel p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="field-label">Resume file</span>
              <input
                className="field-input"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Uploading..." : "Upload Resume"}
              </button>
              <p className="text-sm text-slate-500">PDF and DOCX only. Maximum size is 10MB.</p>
            </div>
          </form>

          {loading && <Loader label="Uploading resume" />}
        </section>
      </main>
    </div>
  );
};

export default ResumeUpload;
