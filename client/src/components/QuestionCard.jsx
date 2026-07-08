import BadgeList from "./BadgeList.jsx";

const QuestionCard = ({ question }) => {
  if (!question) {
    return null;
  }

  return (
    <article className="panel p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand ring-1 ring-blue-100">
          {question.category}
        </span>
        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
          {question.difficulty}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-bold leading-8 text-ink">{question.question}</h2>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Expected topics</p>
        <BadgeList items={question.expectedTopics} tone="slate" />
      </div>
    </article>
  );
};

export default QuestionCard;
