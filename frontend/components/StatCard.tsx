interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="glass rounded-3xl p-6">
      <p className="mb-2 text-sm font-medium text-slate-400">{label}</p>
      <p className="text-3xl font-black tracking-tight text-white">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}