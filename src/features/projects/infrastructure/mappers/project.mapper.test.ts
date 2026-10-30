import { expect, it } from 'vitest';
import { mapProject } from './project.mapper';
it('maps external names, status and date to the domain model', () => {
  const project = mapProject({
    id: 'p1',
    name: 'Proyecto',
    description: 'Descripción',
    course_name: 'Curso',
    status: 'ARCHIVED',
    repository_url: null,
    member_count: 3,
    updated_at: '2026-10-28T15:00:00Z',
  });
  expect(project).toEqual({
    id: 'p1',
    name: 'Proyecto',
    description: 'Descripción',
    course: 'Curso',
    status: 'archived',
    repositoryUrl: null,
    memberCount: 3,
    updatedAt: new Date('2026-10-28T15:00:00Z'),
  });
  expect(project).not.toHaveProperty('course_name');
});
