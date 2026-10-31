export type StudentActivityStatus = 'up_to_date' | 'review' | 'support';
export interface StudentCourse {
  id: string;
  name: string;
  section: string;
  term: string;
  studentCount: number;
}
export interface CourseStudent {
  id: string;
  name: string;
  email: string;
  team: string;
  projectId: string;
  projectName: string;
  participation: number;
  commits: number;
  status: StudentActivityStatus;
}
export interface StudentRoster {
  course: StudentCourse;
  courses: StudentCourse[];
  students: CourseStudent[];
  total: number;
  regularActivity: number;
  needsReview: number;
  updatedAt: string;
}
export interface StudentContribution {
  student: CourseStudent;
  course: StudentCourse;
  period: string;
  reviewedChanges: number;
  evidence: {
    id: string;
    title: string;
    description: string;
    recordedAt: string;
  }[];
  guidance: string;
  updatedAt: string;
}
