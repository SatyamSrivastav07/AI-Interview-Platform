const ErrorState = ({ title = "Something went wrong", message, onRetry }) => (
  <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-lg font-bold text-rose-700 shadow-sm">
      !
    </div>
    <h2 className="mt-5 text-lg font-bold text-ink">{title}</h2>
    {message && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-rose-800">{message}</p>}
    {onRetry && (
      <button type="button" className="secondary-button mt-5" onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;
