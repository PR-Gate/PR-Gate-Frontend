import { setupWorker } from 'msw/browser';
import { createProjectHandlers } from './handlers';
import { createTeacherOverviewHandlers } from './teacher-overview.handlers';
import { createAssessmentHandlers } from './assessment.handlers';
import { createRubricHandlers } from './rubric.handlers';
import { createStudentHandlers } from './student.handlers';
export async function startMocks(baseUrl: string) {
  const base = new URL(baseUrl, window.location.origin)
    .toString()
    .replace(/\/$/, '');
  const worker = setupWorker(
    ...createProjectHandlers(base, 400),
    ...createTeacherOverviewHandlers(base, 400),
    ...createAssessmentHandlers(base, 300),
    ...createRubricHandlers(base, 300),
    ...createStudentHandlers(base, 300),
  );
  await worker.start({ onUnhandledFrame: 'bypass' });
}
