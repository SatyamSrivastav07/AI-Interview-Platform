import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });

  const destination = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(form);
    navigate(destination, { replace: true });
  };

  return (
    <main className="grid min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-0 lg:py-0">
      <section className="hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">AI Interview Platform</p>
          <h1 className="mt-5 max-w-xl text-5xl font-bold leading-tight">
            Practice smarter with resume-aware interview preparation.
          </h1>
        </div>
        <p className="max-w-lg text-sm leading-6 text-slate-300">
          Upload your resume, generate focused questions, and track answer feedback as the platform grows.
        </p>
      </section>

      <section className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="panel p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">Login to continue your interview preparation.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="field-label">Email</span>
              <input
                className="field-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="field-label">Password</span>
              <input
                className="field-input"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />
            </label>

            <button type="submit" className="primary-button w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {loading && <Loader label="Authenticating" />}

          <p className="mt-6 text-center text-sm text-slate-600">
            New here?{" "}
            <Link className="font-semibold text-brand hover:text-blue-700" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
