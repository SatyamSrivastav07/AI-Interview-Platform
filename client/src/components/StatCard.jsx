const StatCard = ({ title, value, description, accent = "brand", footer }) => {
  const accentClasses = {
    brand: "bg-blue-50 text-brand",
    mint: "bg-teal-50 text-mint",
    amber: "bg-amber-50 text-amber",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <section className="panel interactive-panel h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-lg px-3 py-1 text-xs font-semibold ${accentClasses[accent]}`}>{title}</div>
        {footer && <span className="text-xs font-medium text-slate-400">{footer}</span>}
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </section>
  );
};

export default StatCard;
