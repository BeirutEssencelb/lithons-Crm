function SkeletonRow() {
  return <div className="h-14 animate-pulse rounded-2xl bg-slate-800/60" />;
}

export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-slate-800/60" />
        <div className="h-4 w-52 animate-pulse rounded bg-slate-800/40" />
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
