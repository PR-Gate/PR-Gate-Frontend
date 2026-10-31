export type RubricStatus = 'draft' | 'published' | 'archived';
export type EvidenceSource =
  | 'sonarqube'
  | 'quality-gate'
  | 'github'
  | 'gitlab'
  | 'pipeline'
  | 'academic-test'
  | 'teacher-review'
  | 'manual';
export type EvaluationType =
  'automatic' | 'teacher-review' | 'automatic-with-review';
export interface AchievementLevel {
  id: string;
  name: string;
  description: string;
  condition: string;
  score: number;
}
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  evidenceSource: EvidenceSource;
  evaluationType: EvaluationType;
  levels: AchievementLevel[];
}
export interface RubricDraft {
  name: string;
  description: string;
  courseId: string;
  sectionId: string;
  expectedScore: number;
  version: string;
  criteria: RubricCriterion[];
}
export interface Rubric extends RubricDraft {
  id: string;
  status: RubricStatus;
  totalScore: number;
  updatedAt: string;
}
export interface RubricCourse {
  id: string;
  name: string;
  expectedScore: number;
  sections: { id: string; name: string }[];
}
export interface StudentCriterionResult {
  criterionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  evidence: string;
  appliedRule: string;
  achievementLevel: string;
  technicalResult: string;
  recommendation: string;
  evidenceDetails: string;
}
export interface StudentRubric {
  rubric: Rubric;
  courseName: string;
  projectName: string;
  reviewStatus: string;
  score: number;
  maxScore: number;
  results: StudentCriterionResult[];
}
export interface RubricLibrary {
  rubrics: Rubric[];
  courses: RubricCourse[];
}
export interface UploadMetadata {
  name: string;
  size: number;
  type: string;
}
export function rubricTotal(criteria: readonly RubricCriterion[]): number {
  return (
    Math.round(
      criteria.reduce((total, criterion) => total + criterion.maxScore, 0) *
        100,
    ) / 100
  );
}
// Authoring validation only. Never evaluates a student's metrics or academic grade.
export function publicationIssues(input: RubricDraft): string[] {
  const issues: string[] = [];
  if (!input.name.trim()) issues.push('Escribe el nombre de la rúbrica.');
  if (!input.courseId || !input.sectionId)
    issues.push('Elige el curso y la sección.');
  if (!input.criteria.length) issues.push('Agrega al menos un criterio.');
  if (rubricTotal(input.criteria) !== input.expectedScore)
    issues.push(`El puntaje total debe ser ${input.expectedScore}.`);
  input.criteria.forEach((criterion, index) => {
    if (!criterion.name.trim() || criterion.maxScore <= 0)
      issues.push(`Completa el nombre y puntaje del criterio ${index + 1}.`);
    if (
      criterion.evaluationType !== 'teacher-review' &&
      !criterion.levels.length
    )
      issues.push(`Configura niveles para el criterio ${index + 1}.`);
    if (
      criterion.levels.some(
        (level) =>
          !level.name.trim() ||
          !level.condition.trim() ||
          level.score < 0 ||
          level.score > criterion.maxScore,
      )
    )
      issues.push(
        `Revisa los niveles del criterio ${index + 1}: nombre, condición y puntaje dentro del máximo.`,
      );
  });
  return issues;
}
