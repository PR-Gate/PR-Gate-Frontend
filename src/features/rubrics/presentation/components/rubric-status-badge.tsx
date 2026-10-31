import type { RubricStatus } from '../../domain/rubric';
import { statusLabels } from '../rubric-labels';
export function RubricStatusBadge({ status }: { status: RubricStatus }) {
  return (
    <span className={`rubric-badge rubric-status-${status}`}>
      {statusLabels[status]}
    </span>
  );
}
