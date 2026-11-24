export default function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-xs text-navy/60 mb-1 px-1">
        <span>{step} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/70 overflow-hidden border border-navy/10">
        <div
          className="h-full rounded-full bg-peach-dark transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
