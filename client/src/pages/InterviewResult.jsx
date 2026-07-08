import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { getInterview } from "../api/interviewApi.js";
import BadgeList from "../components/BadgeList.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Navbar from "../components/Navbar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Skeleton from "../components/Skeleton.jsx";

const isAnswered = (question) => Boolean(question?.userAnswer?.trim());

const uniqueTopItems = (items, limit = 5) => {
  const counts = items.reduce((summary, item) => {
    if (item) {
      summary[item] = (summary[item] || 0) + 1;
    }

    return summary;
  }, {});

  return Object.entries(counts)
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, limit)
    .map(([item]) => item);
};

const getAverageScore = (questions) => {
  const answeredQuestions = questions.filter(isAnswered);

  if (answeredQuestions.length === 0) {
    return 0;
  }

  const totalScore = answeredQuestions.reduce((sum, question) => sum + (question.score || 0), 0);

  return Math.round(totalScore / answeredQuestions.length);
};

const getPerformanceLabel = (averageScore) => {
  if (averageScore >= 85) {
    return "Excellent interview performance with strong, well-rounded answers.";
  }

  if (averageScore >= 70) {
    return "Solid performance with a few areas that can be sharpened.";
  }

  if (averageScore >= 50) {
    return "Developing performance. Focused practice can lift answer depth and structure.";
  }

  return "Early-stage performance. Revisit the core topics and practice concise answer framing.";
};

const StatTile = ({ label, value, tone = "blue" }) => {
  const toneClasses = {
    blue: "bg-blue-50 text-brand",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="panel interactive-panel p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-md px-3 py-1.5 text-2xl font-bold ${toneClasses[tone] || toneClasses.blue}`}>
        {value}
      </p>
    </div>
  );
};

const InterviewResult = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInterview = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getInterview(interviewId);
      setInterview(data.interview);
    } catch (loadError) {
      const message = loadError.response?.data?.message || "Could not load interview result";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  const questions = interview?.questions || [];
  const answeredQuestions = useMemo(() => questions.filter(isAnswered), [questions]);
  const totalQuestions = questions.length;
  const answeredCount = answeredQuestions.length;
  const averageScore = useMemo(() => getAverageScore(questions), [questions]);
  const bestScore = answeredQuestions.length > 0 ? Math.max(...answeredQuestions.map((question) => question.score || 0)) : 0;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const strongAreas = useMemo(
    () => uniqueTopItems(answeredQuestions.flatMap((question) => question.strengths || [])),
    [answeredQuestions]
  );
  const weakAreas = useMemo(
    () => uniqueTopItems(answeredQuestions.flatMap((question) => question.improvements || [])),
    [answeredQuestions]
  );
  const recommendedTopics = useMemo(() => {
    const lowerScoredTopics = answeredQuestions
      .filter((question) => (question.score || 0) < 75)
      .flatMap((question) => question.expectedTopics || []);
    const sourceTopics = lowerScoredTopics.length > 0 ? lowerScoredTopics : questions.flatMap((question) => question.expectedTopics || []);

    return uniqueTopItems(sourceTopics);
  }, [answeredQuestions, questions]);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        {loading ? (
          <section className="grid gap-6">
            <div className="panel p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-5 h-10 w-72 max-w-full" />
              <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="panel p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-9 w-20" />
                </div>
              ))}
            </div>
          </section>
        ) : error || !interview ? (
          <ErrorState
            title="Result unavailable"
            message={error || "This interview result could not be loaded."}
            onRetry={loadInterview}
          />
        ) : (
          <>
            <SectionHeader
              eyebrow="Interview Result"
              title={interview.role}
              description="Review your performance summary, question-level feedback, and next practice priorities."
              actions={
                <>
                  <Link to="/dashboard" className="secondary-button">
                    Back to Dashboard
                  </Link>
                  <Link to="/history" className="secondary-button">
                    View History
                  </Link>
                  <Link to="/generate-interview" className="primary-button">
                    Retake Interview
                  </Link>
                  <Link to="/resume" className="secondary-button">
                    Upload New Resume
                  </Link>
                </>
              }
            />
            <section className="mb-8">
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand ring-1 ring-blue-100">
                    {interview.interviewType}
                  </span>
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                    {interview.difficulty}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </span>
                </div>
            </section>

            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Total Questions" value={totalQuestions} />
              <StatTile label="Answered Questions" value={answeredCount} tone="teal" />
              <StatTile label="Average Score" value={`${averageScore}%`} tone="amber" />
              <StatTile label="Best Score" value={`${bestScore}%`} tone="slate" />
            </section>

            <section className="mt-5 grid gap-5 sm:grid-cols-2">
              <StatTile label="Completion" value={`${completionPercentage}%`} tone="teal" />
              <div className="panel p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Performance</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{getPerformanceLabel(averageScore)}</p>
              </div>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="panel p-6">
                <h2 className="text-lg font-bold text-ink">Strong Areas</h2>
                <div className="mt-4">
                  <BadgeList items={strongAreas} tone="teal" emptyText="Submit answers to reveal strengths." />
                </div>
              </div>
              <div className="panel p-6">
                <h2 className="text-lg font-bold text-ink">Weak Areas</h2>
                <div className="mt-4">
                  <BadgeList items={weakAreas} tone="rose" emptyText="No improvement themes found yet." />
                </div>
              </div>
              <div className="panel p-6">
                <h2 className="text-lg font-bold text-ink">Recommended Topics</h2>
                <div className="mt-4">
                  <BadgeList items={recommendedTopics} tone="blue" emptyText="No topic recommendations yet." />
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand">Question Review</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">Answer-by-answer feedback</h2>
              </div>

              <div className="grid gap-5">
                {questions.map((question) => (
                  <article key={question.id} className="panel p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          Q{question.id}
                        </span>
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand ring-1 ring-blue-100">
                          {question.category}
                        </span>
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                          {question.difficulty}
                        </span>
                      </div>
                      <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-700 ring-1 ring-teal-100">
                        {question.score || 0}%
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold leading-7 text-ink">{question.question}</h3>

                    <div className="mt-5 grid gap-5">
                      <div>
                        <p className="text-sm font-bold text-ink">User answer</p>
                        <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                          {question.userAnswer || "No answer submitted."}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-ink">Feedback</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{question.feedback || "No feedback available."}</p>
                      </div>

                      <div className="grid gap-5 lg:grid-cols-2">
                        <div>
                          <p className="mb-2 text-sm font-bold text-ink">Strengths</p>
                          <BadgeList items={question.strengths} tone="teal" emptyText="No strengths saved." />
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-bold text-ink">Improvements</p>
                          <BadgeList items={question.improvements} tone="rose" emptyText="No improvements saved." />
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-bold text-ink">Expected Topics</p>
                        <BadgeList items={question.expectedTopics} tone="slate" />
                      </div>

                      <details className="rounded-xl border border-slate-200 bg-white p-4">
                        <summary className="cursor-pointer text-sm font-bold text-ink">Ideal Answer</summary>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {question.idealAnswer || "Ideal answer is not available in the saved interview result."}
                        </p>
                      </details>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default InterviewResult;
