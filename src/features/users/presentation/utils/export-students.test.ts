import { expect, it } from 'vitest';
import { serializeStudentsCsv } from './export-students';
it('exports only visible rows with clear demo labeling and safe spreadsheet text', () => {
  const csv = serializeStudentsCsv(
    {
      id: 'software',
      name: 'Ingeniería de Software',
      section: '01',
      term: '2026-II',
      studentCount: 5,
    },
    [
      {
        id: '1',
        name: '=HYPERLINK("bad")',
        email: 'test@example.test',
        team: 'Equipo',
        projectId: 'campus',
        projectName: 'Proyecto',
        commits: 26,
        participation: 78,
        status: 'up_to_date',
      },
    ],
  );
  expect(csv).toContain('DEMOSTRACIÓN');
  expect(csv).toContain('no una calificación');
  expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  expect(csv).toContain('"78","26"');
  expect(csv).not.toContain('Lucía Ramos');
});
