const LoadingButton = ({
  children,
  loading = false,
  loadingText = "Loading...",
  className = "primary-button",
  disabled,
  type = "button",
  ...props
}) => (
  <button type={type} className={className} disabled={disabled || loading} {...props}>
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
    <span>{loading ? loadingText : children}</span>
  </button>
);

export default LoadingButton;
