import { expect, it } from 'vitest';
import type { TeacherOverview } from '../../domain/entities/teacher-overview.entity';
import { serializeOverviewCsv } from './export-overview';
it('exports displayed data, preserves quoting and neutralizes spreadsheet formulas', () => {
  const overview: TeacherOverview = {
    course: { id: 'c1', name: '=HYPERLINK("bad")', section: '01' },
    courses: [],
    generatedAt: new Date('2026-10-30T15:00:00Z'),
    activeCourses: 3,
    evaluatedProjects: 24,
    pendingEvaluations: 7,
    criticalAlerts: 3,
    savedMinutes: 1120,
    activeStudents: 86,
    totalStudents: 92,
    totalProjects: 32,
    distribution: [],
    projects: [],
    activities: [],
    students: [],
  };
  const csv = serializeOverviewCsv(overview, [], '7');
  expect(csv).toContain('DEMOSTRACIÓN');
  expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  expect(csv).toContain('"Proyectos evaluados","24"');
  expect(csv).toContain('"Periodo (días)","7"');
});
