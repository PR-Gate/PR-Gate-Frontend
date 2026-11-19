export interface EvaluationPage<T> { items: T[]; page: number; size: number; hasNext: boolean }
export interface EvaluationCourse { id: string; name: string; section: string; academicPeriod: string }
export interface AcademicProject { id: string; courseId: string; name: string; organizationLogin: string | null }
export interface EvaluationRepository { id: number; fullName: string; gitRef: string; lastAnalyzedAt: string }
export interface RubricCriterion { id: string; description: string; objective: string; maxPoints: number }
export interface PublishedRubric { id: string; version: number; title: string; maxPoints: 20; criteria: RubricCriterion[] }
export interface EvaluationCheck { id: string; criterionId: string; type: 'METRIC' | 'RULE' | 'MANUAL'; key: string; operator: 'LT' | 'LTE' | 'EQ' | 'GTE' | 'GT' | null; threshold: number | null }
export interface ApprovedEvaluation { id: string; projectId: string; repositoryId: number; gitRef: string; rubric: PublishedRubric; checks: EvaluationCheck[] }
export interface GateSynchronization { synchronization_state: 'PENDING' | 'DELIVERED' | 'APPLIED' | 'FAILED' | 'SUPERSEDED'; gate_name: string | null }
export interface AnalysisRevision { eventId: string; repositoryId: number; gitRef: string; commitSha: string; analyzedAt: string; qualityGateStatus: string }
export interface CriterionCompliance { criterionId: string; maxPoints: number; status: string; checks: { id: string; status: string; reason: string }[] }
export interface TechnicalEvaluation { id: string; configurationId: string; eventId: string; repositoryId: number; gitRef: string; commitSha: string; status: string; evidenceState: string; technicalCompliance: { evaluatedMaxPoints: number; provisionalCompliancePercent: number | null; completeCompliancePercent: number | null; criteria: CriterionCompliance[] }; decisions: { checkId: string; passed: boolean; justification: string }[] }
export interface AnalysisEvidence { reference: AnalysisRevision; evidence: { state: string; measures: Record<string, number> } }
export interface GradeEstimate { id: string; status: 'COMPLETE' | 'PARTIAL'; officialGrade: false; maxScore: 20; estimatedScore: number | null; estimatedSubtotal: number; coveredMaxPoints: number; summary: string; criteria: { criterionId: string; estimatedPoints: number | null; justification: string }[] }
export interface PublishRubricInput { title: string; criteria: RubricCriterion[] }
export interface ApproveEvaluationInput { rubricId: string; rubricVersion: number; repositoryId: number; gitRef: string; checks: Omit<EvaluationCheck, 'id'>[] }
export interface EvaluationRepositoryPort {
  practice(projectId: string, signal?: AbortSignal): Promise<{ canGenerate: boolean; tests: PracticeTest[] }>;
  generatePractice(projectId: string): Promise<PracticeTest>;
  submitPractice(projectId: string, testId: string, answers: number[]): Promise<PracticeTest>;
  pipelineRuns(projectId: string, page: number, signal?: AbortSignal): Promise<PipelineRun[]>;
  archiveRubric(courseId: string, rubricId: string): Promise<void>;
  analyzeRubricDocument(courseId: string, text: string): Promise<{
    title: string; criteria: { description: string; objective: string; maxPoints: number | null }[];
  }>;
  proposeRubric(courseId: string, rubricId: string, version: number, language: string): Promise<TechnicalProposal>;
  readRubricDocument(file: File): Promise<string>;
  courses(page: number, signal?: AbortSignal): Promise<EvaluationPage<EvaluationCourse>>;
  projects(courseId: string, page: number, signal?: AbortSignal): Promise<EvaluationPage<AcademicProject>>;
  repositories(projectId: string, signal?: AbortSignal): Promise<EvaluationRepository[]>;
  rubrics(projectId: string, page: number, signal?: AbortSignal): Promise<PublishedRubric[]>;
  configurations(projectId: string, repositoryId: number, signal?: AbortSignal): Promise<ApprovedEvaluation[]>;
  configuration(projectId: string, id: string, signal?: AbortSignal): Promise<ApprovedEvaluation>;
  publish(projectId: string, input: PublishRubricInput, previousId?: string): Promise<PublishedRubric>;
  approve(projectId: string, input: ApproveEvaluationInput): Promise<ApprovedEvaluation>;
  gate(projectId: string, configurationId: string, signal?: AbortSignal): Promise<GateSynchronization>;
  retryGate(projectId: string, configurationId: string): Promise<GateSynchronization>;
  analyses(projectId: string, repository: EvaluationRepository, page: number, signal?: AbortSignal): Promise<AnalysisRevision[]>;
  evaluations(projectId: string, repositoryId: number, page: number, signal?: AbortSignal): Promise<TechnicalEvaluation[]>;
  evaluate(projectId: string, configurationId: string, eventId: string): Promise<TechnicalEvaluation>;
  evidence(projectId: string, evaluationId: string, signal?: AbortSignal): Promise<AnalysisEvidence>;
  estimate(projectId: string, evaluationId: string, signal?: AbortSignal): Promise<GradeEstimate | null>;
  generateEstimate(projectId: string, evaluationId: string): Promise<GradeEstimate>;
  review(projectId: string, evaluationId: string, input: { checkId: string; passed: boolean; justification: string }): Promise<TechnicalEvaluation>;
}

export interface PracticeTest {
  id: string;
  correctCount: number | null;
  questions: {
    prompt: string;
    options: string[];
    selectedOption: number | null;
    correctOption: number | null;
    explanation: string | null;
  }[];
}

export interface PipelineRun {
  id: string;
  repository: string;
  workflowName: string;
  branch: string;
  commitSha: string;
  status: string;
  conclusion: string | null;
  attempt: number;
  runUrl: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  sonarAnalysis: { qualityGateStatus: string } | null;
}
export interface TechnicalProposal {
  id: string;
  checks: { criterionId: string; mechanism: string; target: string; rationale: string; parameters: Record<string, string> }[];
}
