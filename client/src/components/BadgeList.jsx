const BadgeList = ({ items = [], emptyText = "No data yet", tone = "blue" }) => {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[tone] || toneClasses.blue}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export default BadgeList;
