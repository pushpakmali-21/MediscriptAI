export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-border-light border-t-brand rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-ink-muted animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
