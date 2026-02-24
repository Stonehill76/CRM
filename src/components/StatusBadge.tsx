import {
  STATUS_LABELS,
  STATUS_COLORS,
  type ApplicationStatus,
} from '../types/application';

const DOT_COLORS: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-600',
  compliance_review: 'bg-amber-600',
  action_required: 'bg-orange-600',
  approved: 'bg-green-600',
  live: 'bg-white',
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[status]}`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
