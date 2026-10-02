/** Skeleton for the verdict page. */
export default function VerdictLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-md py-md">
      <div className="h-8 w-1/2 rounded-md bg-surface-container-highest" />
      <div className="grid grid-cols-2 gap-xs sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-md border-2 border-outline-variant bg-surface-container" />
        ))}
      </div>
      <div className="h-96 rounded-xl border-2 border-outline-variant bg-surface-container" />
    </div>
  );
}
