export function LoadingSpinner() {
  return (
    <div role="status" aria-label="Loading" className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
