export type TestStatus = 'draft' | 'scheduled' | 'published' | 'finished';
export type ResponseStatus =
  'not_started' | 'in_progress' | 'submitted' | 'needs_review' | 'graded';
export interface Question {
  id: string;
  kind: 'multiple' | 'boolean' | 'open';
  prompt: string;
  options: string[];
  correctAnswer: string;
  points: number;
  feedback: string;
}
export interface Assignment {
  mode: 'all' | 'teams' | 'students';
  ids: string[];
}
export interface TestDraft {
  title: string;
  courseId: string;
  durationMinutes: number;
  instructions: string;
  questions: Question[];
  assignment: Assignment;
  opensAt: string;
  closesAt: string;
}
export interface Participant {
  id: string;
  name: string;
  status: ResponseStatus;
  submittedAt: string | null;
  score: number | null;
  answers: {
    questionId: string;
    value: string;
    score: number | null;
    feedback: string;
  }[];
}
export interface TestResults {
  average: number | null;
  participation: number;
  difficultQuestions: { label: string; detail: string }[];
  distribution: { label: string; count: number }[];
  support: { name: string; reason: string }[];
}
export interface Assessment extends TestDraft {
  id: string;
  courseName: string;
  section: string;
  status: TestStatus;
  assignedCount: number;
  respondedCount: number;
  pendingReview: number;
  pendingResponses: number;
  totalPoints: number;
  participants: Participant[];
  results: TestResults;
}
export interface AssessmentList {
  tests: Assessment[];
  publishedCount: number;
  pendingResponses: number;
  pendingReview: number;
}
export interface AssessmentCatalog {
  courses: {
    id: string;
    name: string;
    section: string;
    students: { id: string; name: string; teamId: string }[];
    teams: { id: string; name: string }[];
  }[];
  savedQuestions: Question[];
}
export interface ReviewInput {
  participantId: string;
  scores: Record<string, number>;
  feedback: string;
}
