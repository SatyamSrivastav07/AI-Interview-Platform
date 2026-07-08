import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { generateInterview } from "../api/interviewApi.js";
import { getMyResume } from "../api/resumeApi.js";
import BadgeList from "../components/BadgeList.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Loader from "../components/Loader.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import Navbar from "../components/Navbar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Skeleton from "../components/Skeleton.jsx";

const experienceLevels = ["Fresher", "Junior", "Mid", "Senior"];
const interviewTypes = ["HR", "Technical", "DSA", "Mixed"];
const difficulties = ["Easy", "Medium", "Hard"];

const initialForm = {
  resumeId: "",
  role: "",
  experienceLevel: "Junior",
  interviewType: "Mixed",
  difficulty: "Medium",
  numberOfQuestions: 8,
};

const getInterviewId = (interview) => interview?._id || interview?.id || "";

const GenerateInterview = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [generatedInterview, setGeneratedInterview] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const loadResume = useCallback(async () => {
    setLoadingResume(true);
    setResumeError("");

    try {
      const { data } = await getMyResume();
      const currentResume = data.resume;

      setResume(currentResume);
      setForm((current) => ({
        ...current,
        resumeId: currentResume?.id || currentResume?._id || "",
      }));
    } catch (error) {
      if (error.response?.status !== 404) {
        const message = error.response?.data?.message || "Could not load resume";

        setResumeError(message);
        toast.error(message);
      }
    } finally {
      setLoadingResume(false);
    }
  }, []);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const questions = generatedInterview?.questions || [];
  const generatedInterviewId = useMemo(() => getInterviewId(generatedInterview), [generatedInterview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resume) {
      toast.error("Upload resume first");
      return;
    }

    if (!form.resumeId || !form.role.trim()) {
      toast.error("Resume and role are required");
      return;
    }

    setGenerating(true);
    setGeneratedInterview(null);

    try {
      const payload = {
        ...form,
        role: form.role.trim(),
        numberOfQuestions: Number(form.numberOfQuestions),
      };
      const { data } = await generateInterview(payload);

      setGeneratedInterview(data.interview);
      toast.success("Interview questions generated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not generate interview");
    } finally {
      setGenerating(false);
    }
  };

  const handleStartAnswering = () => {
    if (generatedInterviewId) {
      navigate(`/interview/${generatedInterviewId}`);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        <SectionHeader
          eyebrow="AI Interview"
          title="Generate Interview Questions"
          description="Create a focused interview set from your resume analysis, target role, experience level, and difficulty."
          actions={
            <Link to="/resume" className="secondary-button">
              Manage Resume
            </Link>
          }
        />

        {loadingResume ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="panel p-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="mt-6 h-11 w-full" />
              <Skeleton className="mt-4 h-11 w-full" />
              <Skeleton className="mt-4 h-11 w-full" />
            </div>
            <div className="panel p-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-6 h-28 w-full" />
            </div>
          </section>
        ) : resumeError ? (
          <ErrorState title="Resume unavailable" message={resumeError} onRetry={loadResume} />
        ) : !resume ? (
          <EmptyState
            icon="!"
            title="Upload resume first"
            description="Interview generation needs a parsed resume so questions can reflect your skills, projects, strengths, and weak areas."
            actionLabel="Upload Resume"
            actionTo="/resume"
          />
        ) : (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={handleSubmit} className="panel p-6">
              <h2 className="text-lg font-bold text-ink">Interview setup</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Resume detected: <span className="font-semibold text-ink">{resume.originalFileName}</span>
              </p>

              <div className="mt-6 grid gap-5">
                <label className="block">
                  <span className="field-label">Resume ID</span>
                  <input className="field-input bg-slate-50" name="resumeId" value={form.resumeId} readOnly />
                </label>

                <label className="block">
                  <span className="field-label">Target role</span>
                  <input
                    className="field-input"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="Full Stack Developer"
                    required
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Experience level</span>
                    <select className="field-input" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="field-label">Interview type</span>
                    <select className="field-input" name="interviewType" value={form.interviewType} onChange={handleChange}>
                      {interviewTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Difficulty</span>
                    <select className="field-input" name="difficulty" value={form.difficulty} onChange={handleChange}>
                      {difficulties.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="field-label">Number of questions</span>
                    <input
                      className="field-input"
                      name="numberOfQuestions"
                      type="number"
                      min="1"
                      max="30"
                      value={form.numberOfQuestions}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>
              </div>

              <LoadingButton type="submit" className="primary-button mt-6 w-full" loading={generating} loadingText="Generating...">
                Generate Questions
              </LoadingButton>

              {generating && <Loader label="Generating interview" />}
            </form>

            <aside className="panel p-6">
              <h2 className="text-lg font-bold text-ink">Resume signals</h2>
              <div className="mt-5 grid gap-5">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Skills</p>
                  <BadgeList items={resume.skills} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Strengths</p>
                  <BadgeList items={resume.strengths} tone="teal" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Weak areas</p>
                  <BadgeList items={resume.weakAreas} tone="rose" />
                </div>
              </div>
            </aside>
          </section>
        )}

        {questions.length > 0 && (
          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-brand">Generated set</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">{questions.length} questions ready</h2>
                {generatedInterviewId && (
                  <p className="mt-2 text-sm text-slate-500">Interview ID: {generatedInterviewId}</p>
                )}
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={handleStartAnswering}
                disabled={!generatedInterviewId}
                title="Start answering"
              >
                Start Answering
              </button>
            </div>

            <div className="grid gap-4">
              {questions.map((item) => (
                <article key={item.id} className="panel p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      Q{item.id}
                    </span>
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand">
                      {item.category}
                    </span>
                    <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="mt-4 text-base font-semibold leading-7 text-ink">{item.question}</p>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Expected topics</p>
                    <BadgeList items={item.expectedTopics} tone="slate" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default GenerateInterview;
