import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
    <section className="max-w-md">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">404</p>
      <h1 className="mt-3 text-4xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/dashboard" className="primary-button mt-6">
        Back to Dashboard
      </Link>
    </section>
  </main>
);

export default NotFound;
