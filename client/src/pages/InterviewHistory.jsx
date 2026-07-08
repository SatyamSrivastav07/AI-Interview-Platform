import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { deleteInterview, getInterviewHistory } from "../api/interviewApi.js";
import EmptyState from "../components/EmptyState.jsx";
import Navbar from "../components/Navbar.jsx";
import Skeleton from "../components/Skeleton.jsx";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getInterviewHistory();
        setInterviews(data.interviews || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load interview history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (interview) => {
    const confirmed = window.confirm(`Delete the "${interview.role}" interview? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setDeletingId(interview.id);

    try {
      await deleteInterview(interview.id);
      setInterviews((current) => current.filter((item) => item.id !== interview.id));
      toast.success("Interview deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete interview");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">History</p>
          <h1 className="mt-3 text-3xl font-bold text-ink">Interview History</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Review generated interviews, answer progress, and scoring summaries.
          </p>
        </section>

        <section>
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="panel p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <EmptyState
              title="No interviews generated yet"
              description="Generate an interview to see progress, continue unfinished sessions, and review results here."
              actionLabel="Generate Interview"
              actionTo="/generate-interview"
            />
          ) : (
            <div className="grid gap-4">
              {interviews.map((interview) => {
                const completed = interview.answeredCount === interview.questionCount;
                const completion = Math.round((interview.answeredCount / interview.questionCount) * 100);

                return (
                  <article key={interview.id} className="panel p-5">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-ink">{interview.role}</h2>
                          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand ring-1 ring-blue-100">
                            {interview.interviewType}
                          </span>
                          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                            {interview.difficulty}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-5">
                          <p>
                            <span className="font-semibold text-ink">Created:</span>{" "}
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-semibold text-ink">Total:</span> {interview.questionCount}
                          </p>
                          <p>
                            <span className="font-semibold text-ink">Answered:</span> {interview.answeredCount}
                          </p>
                          <p>
                            <span className="font-semibold text-ink">Average:</span> {interview.averageScore}%
                          </p>
                          <p>
                            <span className="font-semibold text-ink">Complete:</span> {completion}%
                          </p>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${completion}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                        <Link to={`/interview/${interview.id}/result`} className="secondary-button min-h-10">
                          View Result
                        </Link>
                        {!completed && (
                          <Link to={`/interview/${interview.id}`} className="primary-button min-h-10">
                            Continue Interview
                          </Link>
                        )}
                        <button
                          type="button"
                          className="inline-flex min-h-10 items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleDelete(interview)}
                          disabled={deletingId === interview.id}
                        >
                          {deletingId === interview.id ? "Deleting..." : "Delete Interview"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InterviewHistory;
