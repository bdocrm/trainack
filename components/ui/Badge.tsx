import clsx from 'clsx';

type BadgeStatus = 'pending' | 'acknowledged' | 'signed' | 'active' | 'inactive';

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
}

const config: Record<BadgeStatus, { color: string; label: string; dot: string }> = {
  pending: { color: 'bg-[#F08530]/10 text-[#D06E1E] border-[#F08530]/20', label: 'Pending', dot: 'bg-[#F08530]' },
  acknowledged: { color: 'bg-[#4094d9]/10 text-[#2E78B8] border-[#4094d9]/20', label: 'Acknowledged', dot: 'bg-[#4094d9]' },
  signed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Signed', dot: 'bg-emerald-500' },
  active: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active', dot: 'bg-emerald-500' },
  inactive: { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Inactive', dot: 'bg-gray-400' },
};

export default function Badge({ status, label }: BadgeProps) {
  const { color, label: defaultLabel, dot } = config[status] ?? config.pending;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', color)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', dot)} />
      {label ?? defaultLabel}
    </span>
  );
}
