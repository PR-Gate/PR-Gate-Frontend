import { expect, it } from 'vitest';
import { publicationIssues, rubricTotal, type RubricDraft } from './rubric';
const valid = (): RubricDraft => ({
  name: 'Rúbrica',
  courseId: 'software',
  sectionId: '01',
  expectedScore: 20,
  description: '',
  version: '1.0',
  criteria: [
    {
      id: 'c1',
      name: 'Criterio',
      description: '',
      maxScore: 20,
      evidenceSource: 'teacher-review',
      evaluationType: 'teacher-review',
      levels: [],
    },
  ],
});
it('sums authoring points without evaluating any student evidence', () => {
  expect(rubricTotal(valid().criteria)).toBe(20);
  expect(publicationIssues(valid())).toEqual([]);
});
it('blocks incomplete publication, mismatched totals and automatic criteria without levels', () => {
  expect(
    publicationIssues({ ...valid(), name: '', courseId: '', criteria: [] }),
  ).toHaveLength(4);
  const draft = valid();
  draft.criteria[0]!.maxScore = 18;
  draft.criteria[0]!.evaluationType = 'automatic';
  expect(publicationIssues(draft)).toContain('El puntaje total debe ser 20.');
  expect(publicationIssues(draft)).toContain(
    'Configura niveles para el criterio 1.',
  );
});
it('rejects incomplete level descriptions and scores above the criterion maximum', () => {
  const draft = valid();
  draft.criteria[0]!.levels = [
    { id: 'l1', name: '', description: '', condition: '', score: 21 },
  ];
  expect(
    publicationIssues(draft).some((issue) =>
      issue.includes('Revisa los niveles'),
    ),
  ).toBe(true);
});
