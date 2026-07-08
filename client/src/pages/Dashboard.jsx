import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const dashboardCards = [
  {
    title: "Resume Upload",
    value: "Start",
    description: "Upload a PDF or DOCX resume and prepare it for AI analysis.",
    accent: "brand",
    to: "/resume",
  },
  {
    title: "Generate Interview",
    value: "Soon",
    description: "Create role-specific questions from your resume analysis.",
    accent: "mint",
    to: "/dashboard",
  },
  {
    title: "Interview History",
    value: "Review",
    description: "Track generated interviews, submitted answers, and scores.",
    accent: "amber",
    to: "/history",
  },
  {
    title: "AI Feedback",
    value: "Improve",
    description: "Use answer feedback to sharpen weak areas before interviews.",
    accent: "slate",
    to: "/history",
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <Navbar />
      <main className="content-shell">
        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Welcome, {user?.name || "Candidate"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Your workspace for resume analysis, interview generation, answer practice, and feedback review.
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => (
            <Link key={card.title} to={card.to} className="block transition hover:-translate-y-0.5">
              <StatCard {...card} />
            </Link>
          ))}
        </section>

        <section className="mt-8 panel p-6">
          <h2 className="text-lg font-bold text-ink">Next step</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload your resume first. Once the backend has analyzed it, upcoming screens can generate interviews and
            display answer feedback.
          </p>
          <Link to="/resume" className="primary-button mt-5">
            Go to Resume Upload
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
