import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ label, value, change, color = 'default', loading }) {
  const valueColors = {
    green: 'text-[#18c997]',
    red: 'text-[#e84057]',
    blue: 'text-[#4e7cf6]',
    purple: 'text-[#a78bfa]',
    default: 'text-[#c9d1e0]',
  };

  const changeNum = parseFloat(change);
  const isPositive = changeNum > 0;
  const hasChange = change !== null && change !== undefined && !isNaN(changeNum);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#242831] bg-[#13151b] p-5">
        <div className="shimmer mb-3 h-3 w-24 rounded bg-[#1a1d25]" />
        <div className="shimmer h-7 w-32 rounded bg-[#1a1d25]" />
        <div className="shimmer mt-2 h-3 w-16 rounded bg-[#1a1d25]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#242831] bg-[#13151b] p-5 transition-colors hover:border-[#2e3340]">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#606880]">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${valueColors[color]}`}>{value}</p>
      {hasChange && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-[#18c997]' : 'text-[#e84057]'}`}>
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <span>{Math.abs(changeNum)}% from last month</span>
        </div>
      )}
    </div>
  );
}
