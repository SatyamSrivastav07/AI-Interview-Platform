import { Link } from "react-router-dom";

const EmptyState = ({ icon = "+", title, description, actionLabel, actionTo }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-white text-xl font-bold text-brand shadow-sm">
      {icon}
    </div>
    <h2 className="mt-5 text-xl font-bold text-ink">{title}</h2>
    {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="primary-button mt-5">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
