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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-sm font-bold text-white shadow-sm">
            AI
          </span>
          <span className="hidden text-base font-bold text-ink sm:inline">AI Interview Platform</span>
        </NavLink>

        <nav className="order-3 flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 sm:order-none sm:w-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-2.5 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                  isActive ? "bg-white text-brand shadow-sm" : "text-slate-600 hover:bg-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-36 truncate text-sm text-slate-600 lg:inline">{user?.name || "Candidate"}</span>
          <button type="button" onClick={handleLogout} className="secondary-button min-h-10 px-3">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
