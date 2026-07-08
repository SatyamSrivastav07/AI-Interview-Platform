const AnalysisCard = ({ title, children, className = "" }) => (
  <section className={`panel p-5 ${className}`}>
    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
    <div className="mt-4">{children}</div>
  </section>
);

export default AnalysisCard;
