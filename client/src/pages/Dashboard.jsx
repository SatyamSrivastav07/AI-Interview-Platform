import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getInterviewStats } from "../api/interviewApi.js";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await getInterviewStats();
        setStats(data.stats || defaultStats);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
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

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Welcome, {user?.name || "Candidate"}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Monitor interview progress, score trends, and resume-powered preparation from one workspace.
            </p>
          </div>
          <Link to="/resume" className="primary-button">
            Upload Resume
          </Link>
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

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="panel p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-ink">Preparation workflow</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Upload resume", "Generate interview", "Review feedback"].map((step, index) => (
                <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-white text-sm font-bold text-brand shadow-sm">
                    {index + 1}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-6">
            <h2 className="text-lg font-bold text-ink">Quick actions</h2>
            <div className="mt-5 grid gap-3">
              <Link to="/resume" className="secondary-button justify-start">
                Resume analysis
              </Link>
              <Link to="/generate-interview" className="secondary-button justify-start">
                Generate interview
              </Link>
              <Link to="/history" className="secondary-button justify-start">
                Interview history
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
