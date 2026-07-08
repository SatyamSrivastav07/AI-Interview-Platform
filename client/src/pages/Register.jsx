import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await register(form);
    navigate("/dashboard", { replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <section className="panel w-full max-w-md p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">Get started</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Set up your candidate workspace in a few seconds.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="field-label">Name</span>
            <input
              className="field-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>

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
              minLength={8}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
            />
          </label>

          <button type="submit" className="primary-button w-full" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {loading && <Loader label="Creating account" />}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-brand hover:text-blue-700" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
