import type { TestStatus } from '../../domain/assessment';
import { testStatusLabels } from '../test-labels';
export function TestStatusBadge({ status }: { status: TestStatus }) {
  return (
    <span className={`test-badge test-state-${status}`}>
      {testStatusLabels[status]}
    </span>
  );
}
