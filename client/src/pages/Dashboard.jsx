import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getInterviewHistory, getInterviewStats } from "../api/interviewApi.js";
import EmptyState from "../components/EmptyState.jsx";
import Navbar from "../components/Navbar.jsx";
import Skeleton from "../components/Skeleton.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const defaultStats = {
  totalInterviews: 0,
  totalAnsweredQuestions: 0,
  averageScore: 0,
  bestScore: 0,
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(defaultStats);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsResponse, historyResponse] = await Promise.all([getInterviewStats(), getInterviewHistory()]);

        setStats(statsResponse.data.stats || defaultStats);
        setRecentInterviews((historyResponse.data.interviews || []).slice(0, 3));
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "Total Interviews",
      value: stats.totalInterviews,
      description: "Interview sessions generated from your resume.",
      accent: "brand",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      description: "Average score across answered questions.",
      accent: "mint",
    },
    {
      title: "Best Score",
      value: `${stats.bestScore}%`,
      description: "Your highest answer evaluation score.",
      accent: "amber",
    },
    {
      title: "Questions Answered",
      value: stats.totalAnsweredQuestions,
      description: "Total submitted answers with feedback.",
      accent: "slate",
    },
  ];
  const quickActions = [
    {
      title: "Resume Upload",
      description: "Add or refresh resume analysis before generating interview questions.",
      to: "/resume",
      action: "Open Resume",
    },
    {
      title: "Generate Interview",
      description: "Create role-specific questions from your resume signals.",
      to: "/generate-interview",
      action: "Generate",
    },
    {
      title: "Interview History",
      description: "Continue incomplete sessions or inspect previous attempts.",
      to: "/history",
      action: "View History",
    },
    {
      title: "View Results",
      description: "Review scores, feedback, strong areas, and recommended topics.",
      to: recentInterviews[0]?.id ? `/interview/${recentInterviews[0].id}/result` : "/history",
      action: "Review",
    },
  ];

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="panel bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Welcome, {user?.name || "Candidate"}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Keep resume analysis, interview practice, and result review moving from one focused workspace.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/generate-interview" className="primary-button">
                Generate Interview
              </Link>
              <Link to="/history" className="secondary-button">
                Review History
              </Link>
            </div>
          </div>
          <div className="panel p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completion</p>
            <p className="mt-3 text-3xl font-bold text-ink">{stats.totalAnsweredQuestions || 0}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">questions answered with AI feedback.</p>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="panel p-5">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="mt-5 h-9 w-20" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              ))
            : statCards.map((card) => <StatCard key={card.title} {...card} />)}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-600">Jump into the core preparation workflow.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.to} className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-sm font-bold text-brand">
                  {action.title.slice(0, 1)}
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{action.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{action.description}</p>
                <span className="mt-4 inline-flex text-sm font-bold text-brand">{action.action}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">Recent interviews</h2>
              <p className="mt-1 text-sm text-slate-600">Latest generated sessions and their progress.</p>
            </div>
            <Link to="/history" className="secondary-button">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="panel p-5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-4 h-4 w-28" />
                  <Skeleton className="mt-5 h-10 w-full" />
                </div>
              ))}
            </div>
          ) : recentInterviews.length === 0 ? (
            <EmptyState
              title="No interviews yet"
              description="Generate your first interview from resume analysis to start tracking progress and feedback."
              actionLabel="Generate Interview"
              actionTo="/generate-interview"
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {recentInterviews.map((interview) => {
                const completed = interview.answeredCount === interview.questionCount;

                return (
                  <article key={interview.id} className="panel p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-ink">{interview.role}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {interview.interviewType} • {interview.difficulty}
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {interview.averageScore}%
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${Math.round((interview.answeredCount / interview.questionCount) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {interview.answeredCount}/{interview.questionCount} answered
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link
                        to={completed ? `/interview/${interview.id}/result` : `/interview/${interview.id}`}
                        className="primary-button min-h-10 flex-1"
                      >
                        {completed ? "View Result" : "Continue"}
                      </Link>
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

export default Dashboard;
