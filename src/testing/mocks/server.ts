import { setupServer } from 'msw/node';
import { createProjectHandlers } from './handlers';
export const server = setupServer(...createProjectHandlers());
