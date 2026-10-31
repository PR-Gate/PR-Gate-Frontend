export type OverviewPeriod = '30' | '7';
export interface AcademicCourse {
  id: string;
  name: string;
  section: string;
}
export type ReviewStatus = 'approved' | 'review' | 'correction' | 'failed';
export interface AttentionProject {
  id: string;
  name: string;
  team: string;
  repository: string;
  lastCommit: Date;
  pipeline: 'success' | 'failed';
  qualityGate: 'passed' | 'failed' | 'pending';
  grade: number | null;
}
export interface TeacherOverview {
  course: AcademicCourse;
  courses: readonly AcademicCourse[];
  generatedAt: Date;
  activeCourses: number;
  evaluatedProjects: number;
  pendingEvaluations: number;
  criticalAlerts: number;
  savedMinutes: number;
  activeStudents: number;
  totalStudents: number;
  totalProjects: number;
  distribution: readonly {
    status: ReviewStatus;
    count: number;
    percentage: number;
  }[];
  activities: readonly {
    id: string;
    kind: 'pipeline' | 'gate' | 'push' | 'evaluation';
    title: string;
    detail: string;
    occurredAt: Date;
    projectId: string;
  }[];
  projects: readonly AttentionProject[];
  students: readonly {
    id: string;
    name: string;
    team: string;
    active: boolean;
  }[];
}
