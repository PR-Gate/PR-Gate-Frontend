import { Check, CircleAlert, TriangleAlert } from 'lucide-react';
import type { StudentActivityStatus } from '../../domain/entities/student.entity';
const labels = {
  up_to_date: 'Al día',
  review: 'Revisar',
  support: 'Requiere acompañamiento',
};
const icons = {
  up_to_date: Check,
  review: TriangleAlert,
  support: CircleAlert,
};
export function StudentStatusBadge({
  status,
}: {
  status: StudentActivityStatus;
}) {
  const Icon = icons[status];
  return (
    <span className={`student-status student-status-${status}`}>
      <Icon size={12} aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
