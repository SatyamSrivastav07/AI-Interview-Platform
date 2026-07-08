const SectionHeader = ({ eyebrow, title, description, actions }) => {
  const TitleTag = eyebrow ? "h1" : "h2";

  return (
    <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>}
        <TitleTag className={`${eyebrow ? "mt-3 text-3xl sm:text-4xl" : "text-2xl"} font-bold tracking-tight text-ink`}>
          {title}
        </TitleTag>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>}
    </section>
  );
};

export default SectionHeader;
