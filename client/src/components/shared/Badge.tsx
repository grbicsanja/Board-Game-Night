import { SessionStatus } from '@bgn/shared';

interface BadgeProps {
  status: SessionStatus;
}

const config: Record<SessionStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-green-100 text-green-800 ring-green-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-800 ring-amber-200' },
  finished: { label: 'Finished', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
};

export function Badge({ status }: BadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      role="status"
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
