const ProgressBar = ({ current = 1, total = 1, answered = 0 }) => {
  const safeTotal = Math.max(total, 1);
  const currentProgress = Math.min(Math.max(current, 1), safeTotal);
  const width = `${Math.round((currentProgress / safeTotal) * 100)}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span>
          Question {currentProgress} of {safeTotal}
        </span>
        <span>{answered}/{safeTotal} submitted</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width }} />
      </div>
    </div>
  );
};

export default ProgressBar;
