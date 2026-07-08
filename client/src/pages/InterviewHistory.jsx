import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { deleteInterview, getInterviewHistory } from "../api/interviewApi.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Navbar from "../components/Navbar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Skeleton from "../components/Skeleton.jsx";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getInterviewHistory();
      setInterviews(data.interviews || []);
    } catch (loadError) {
      const message = loadError.response?.data?.message || "Could not load interview history";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setDeletingId(pendingDelete.id);

    try {
      await deleteInterview(pendingDelete.id);
      setInterviews((current) => current.filter((item) => item.id !== pendingDelete.id));
      setPendingDelete(null);
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
        <SectionHeader
          eyebrow="History"
          title="Interview History"
          description="Review generated interviews, answer progress, and scoring summaries."
        />

        {error && (
          <section className="mb-8">
            <ErrorState title="History unavailable" message={error} onRetry={fetchHistory} />
          </section>
        )}

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
                  <article key={interview.id} className="panel interactive-panel p-5">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-ink">{interview.role}</h2>
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand ring-1 ring-blue-100">
                            {interview.interviewType}
                          </span>
                          <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
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
                          className="danger-button min-h-10"
                          onClick={() => setPendingDelete(interview)}
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
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete interview?"
        message={
          pendingDelete
            ? `This will permanently delete the "${pendingDelete.role}" interview and its saved answers.`
            : ""
        }
        confirmLabel={deletingId ? "Deleting..." : "Delete Interview"}
        loading={Boolean(deletingId)}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default InterviewHistory;
