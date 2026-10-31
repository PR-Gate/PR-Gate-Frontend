import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
import { createProjectHandlers } from './mocks/handlers';
import { createTeacherOverviewHandlers } from './mocks/teacher-overview.handlers';
import { createAssessmentHandlers } from './mocks/assessment.handlers';
import { createRubricHandlers } from './mocks/rubric.handlers';
import { createStudentHandlers } from './mocks/student.handlers';
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers(
    ...createProjectHandlers(),
    ...createTeacherOverviewHandlers(),
    ...createAssessmentHandlers(),
    ...createRubricHandlers(),
    ...createStudentHandlers(),
  );
});
afterAll(() => server.close());
