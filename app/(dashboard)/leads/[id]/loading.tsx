export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-800/40" />
        <div className="h-9 w-56 animate-pulse rounded-lg bg-slate-800/60" />
        <div className="h-4 w-36 animate-pulse rounded bg-slate-800/40" />
      </div>
      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-800/40" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-800/60" />
          </div>
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-slate-800/40" />
    </div>
  );
}
