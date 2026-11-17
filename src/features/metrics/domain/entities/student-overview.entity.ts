/** Presentation model; the backend contract is not yet defined. */
export interface StudentGrade {
  value: number;
  maximum: number;
}

export interface StudentOverview {
  projects: {
    total: number | null;
    active: number | null;
    completed: number | null;
    items: readonly {
      id: string;
      name: string;
      course: string;
      status: string | null;
      grade: StudentGrade | null;
    }[];
  } | null;
  pipelines: {
    total: number | null;
    successful: number | null;
    periodLabel: string | null;
  } | null;
  qualityGates: {
    passed: number | null;
    total: number | null;
    requiringCorrection: number | null;
  } | null;
  currentGrade: StudentGrade | null;
  latestEvaluation: {
    projectName: string;
    pipelineLabel: string | null;
    reviewLabel: string | null;
    grade: StudentGrade | null;
    metrics: readonly {
      id: string;
      label: string;
      formattedValue: string | null;
      assessmentLabel: string | null;
    }[];
  } | null;
  recommendation: { title: string; description: string } | null;
}

export type StudentOverviewState =
  | { status: 'integration-pending' }
  | { status: 'available'; overview: StudentOverview };
