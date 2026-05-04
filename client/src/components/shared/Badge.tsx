import { SessionStatus } from '@bgn/shared';

interface BadgeProps {
  status: SessionStatus;
}

const config: Record<SessionStatus, { label: string; className: string }> = {
  open: { label: 'OPEN', className: 'bg-green-100 text-green-800 border-green-400' },
  in_progress: { label: 'PLAYING', className: 'bg-amber-100 text-amber-800 border-amber-400' },
  finished: { label: 'DONE', className: 'bg-gray-100 text-gray-500 border-gray-300' },
};

export function Badge({ status }: BadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      role="status"
      className={`inline-flex items-center border-2 px-2 py-0.5 text-[7px] font-bold ${className}`}
    >
      {label}
    </span>
  );
}
