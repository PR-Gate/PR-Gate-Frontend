import { setupServer } from 'msw/node';
import { createProjectHandlers } from './handlers';
import { createTeacherOverviewHandlers } from './teacher-overview.handlers';
import { createAssessmentHandlers } from './assessment.handlers';
import { createRubricHandlers } from './rubric.handlers';
import { createStudentHandlers } from './student.handlers';
export const server = setupServer(
  ...createProjectHandlers(),
  ...createTeacherOverviewHandlers(),
  ...createAssessmentHandlers(),
  ...createRubricHandlers(),
  ...createStudentHandlers(),
);
