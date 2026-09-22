const toneMap: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  INACTIVE: "bg-slate-200 text-slate-700 ring-slate-300",
  DRAFT: "bg-amber-100 text-amber-800 ring-amber-200",
  SUSPENDED: "bg-orange-100 text-orange-800 ring-orange-200",
  EXPIRED: "bg-rose-100 text-rose-800 ring-rose-200",
  TERMINATED: "bg-slate-300 text-slate-700 ring-slate-400",
  PLANNED: "bg-sky-100 text-sky-700 ring-sky-200",
  DISPATCHED: "bg-blue-100 text-blue-700 ring-blue-200",
  IN_TRANSIT: "bg-violet-100 text-violet-700 ring-violet-200",
  DELIVERED: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-slate-200 text-slate-700 ring-slate-300",
  FAILED: "bg-rose-100 text-rose-700 ring-rose-200",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = toneMap[value] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
