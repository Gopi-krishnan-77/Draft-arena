/** Skeleton for the draft room while state loads. */
export default function RoomLoading() {
  return (
    <div className="animate-pulse space-y-md py-sm">
      <div className="h-8 w-2/3 rounded-md bg-surface-container-highest" />
      <div className="h-28 rounded-xl border-2 border-outline-variant bg-surface-container" />
      <div className="grid gap-md lg:grid-cols-[1fr_minmax(300px,360px)]">
        <div className="space-y-sm">
          <div className="h-12 rounded-md bg-surface-container" />
          <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-xl border-2 border-outline-variant bg-surface-container" />
            ))}
          </div>
        </div>
        <div className="space-y-md">
          <div className="h-48 rounded-xl border-2 border-outline-variant bg-surface-container" />
          <div className="h-64 rounded-xl border-2 border-outline-variant bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
