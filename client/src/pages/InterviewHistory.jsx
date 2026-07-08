import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getInterviewHistory } from "../api/interviewApi.js";
import Loader from "../components/Loader.jsx";
import Navbar from "../components/Navbar.jsx";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

        <section className="panel overflow-hidden">
          {loading ? (
            <Loader label="Loading history" />
          ) : interviews.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No interviews generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Answered</th>
                    <th className="px-4 py-3">Average</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="text-slate-700">
                      <td className="px-4 py-3 font-medium text-ink">{interview.role}</td>
                      <td className="px-4 py-3">{interview.interviewType}</td>
                      <td className="px-4 py-3">{interview.difficulty}</td>
                      <td className="px-4 py-3">
                        {interview.answeredCount}/{interview.questionCount}
                      </td>
                      <td className="px-4 py-3">{interview.averageScore}</td>
                      <td className="px-4 py-3">{new Date(interview.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InterviewHistory;
