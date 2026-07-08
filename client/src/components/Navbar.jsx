import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Resume", to: "/resume" },
  { label: "Generate Interview", to: "/generate-interview" },
  { label: "History", to: "/history" },
];

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <NavLink to="/dashboard" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-sm font-bold text-white shadow-sm">
            AI
          </span>
          <span className="hidden text-base font-bold text-ink sm:inline">AI Interview Platform</span>
        </NavLink>

        <button
          type="button"
          className="secondary-button min-h-10 px-3 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation menu"
        >
          <span className="text-lg leading-none">{menuOpen ? "x" : "="}</span>
        </button>

        <nav
          id="primary-navigation"
          className={`order-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-1 lg:order-none lg:block lg:w-auto ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <div className="grid gap-1 sm:grid-cols-4 lg:flex lg:items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-center text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                    isActive ? "bg-white text-brand shadow-sm" : "text-slate-600 hover:bg-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="hidden max-w-36 truncate text-sm text-slate-600 lg:inline">{user?.name || "Candidate"}</span>
          <button type="button" onClick={handleLogout} className="secondary-button min-h-10 px-3">
            Logout
          </button>
        </div>

        {menuOpen && (
          <div className="order-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 lg:hidden">
            <span className="max-w-44 truncate text-sm text-slate-600">{user?.name || "Candidate"}</span>
            <button type="button" onClick={handleLogout} className="secondary-button min-h-10 px-3">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
