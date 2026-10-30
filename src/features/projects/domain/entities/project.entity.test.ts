import { describe, expect, it } from 'vitest';
import { canOpenRepository, type Project } from './project.entity';
const project: Project = {
  id: '1',
  name: 'Proyecto',
  description: '',
  course: '',
  status: 'active',
  repositoryUrl: null,
  memberCount: 0,
  updatedAt: new Date(),
};
describe('Repository link eligibility', () => {
  it('only opens valid HTTPS repository URLs', () => {
    expect(canOpenRepository(project)).toBe(false);
    expect(
      canOpenRepository({ ...project, repositoryUrl: 'javascript:alert(1)' }),
    ).toBe(false);
    expect(canOpenRepository({ ...project, repositoryUrl: 'broken' })).toBe(
      false,
    );
    expect(
      canOpenRepository({
        ...project,
        repositoryUrl: 'http://example.test/repo',
      }),
    ).toBe(false);
    expect(
      canOpenRepository({
        ...project,
        repositoryUrl: 'https://github.com/example/repo',
      }),
    ).toBe(true);
  });
});
