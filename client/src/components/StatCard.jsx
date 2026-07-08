const StatCard = ({ title, value, description, accent = "brand" }) => {
  const accentClasses = {
    brand: "bg-blue-50 text-brand",
    mint: "bg-teal-50 text-mint",
    amber: "bg-amber-50 text-amber",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <section className="panel p-5">
      <div className={`mb-4 inline-flex rounded-md px-3 py-1 text-xs font-semibold ${accentClasses[accent]}`}>
        {title}
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </section>
  );
};

export default StatCard;
