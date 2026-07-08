import { Link } from "react-router-dom";

const EmptyState = ({ title, description, actionLabel, actionTo }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white text-lg font-bold text-brand shadow-sm">
      +
    </div>
    <h2 className="mt-5 text-lg font-bold text-ink">{title}</h2>
    {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="primary-button mt-5">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
