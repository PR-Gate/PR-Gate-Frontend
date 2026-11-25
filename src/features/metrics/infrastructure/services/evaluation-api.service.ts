import { z } from 'zod';
import { readRubricDocument } from './rubric-document';
import type { HttpClient } from '@/shared/services/http/http-client';
import { HttpError } from '@/shared/services/http/http-error';
import type { EvaluationRepositoryPort, PublishRubricInput, ApproveEvaluationInput, EvaluationRepository } from '../../domain/evaluation';

const id = z.uuid();
const percentage = z.number().min(0).max(100).nullable();
const points = z.number().min(0).max(20);
const criterion = z.object({ id, description: z.string(), objective: z.string(), maxPoints: points });
const rubric = z.object({ id, version: z.number().int().positive(), title: z.string(), maxPoints: z.literal(20), criteria: z.array(criterion) });
const check = z.object({ id, criterionId: id, type: z.enum(['METRIC', 'RULE', 'MANUAL']), key: z.string(), operator: z.enum(['LT', 'LTE', 'EQ', 'GTE', 'GT']).nullable(), threshold: z.number().nullable() });
const configuration = z.object({ id, projectId: id, repositoryId: z.number().int().positive(), gitRef: z.string(), rubric, checks: z.array(check) });
const gate = z.object({ synchronization_state: z.enum(['PENDING', 'DELIVERED', 'APPLIED', 'FAILED', 'SUPERSEDED']), gate_name: z.string().nullable() });
const analysis = z.object({ eventId: id, repositoryId: z.number().int().positive(), gitRef: z.string(), commitSha: z.string().regex(/^[a-f0-9]{40}([a-f0-9]{24})?$/), analyzedAt: z.string(), qualityGateStatus: z.string() });
const evaluation = z.object({
  id, configurationId: id, eventId: id, repositoryId: z.number().int().positive(), gitRef: z.string(), commitSha: z.string(), status: z.string(), evidenceState: z.string(),
  technicalCompliance: z.object({ evaluatedMaxPoints: points, provisionalCompliancePercent: percentage, completeCompliancePercent: percentage,
    criteria: z.array(z.object({ criterionId: id, maxPoints: points, status: z.string(), checks: z.array(z.object({ checkId: z.object({ value: id }), status: z.string(), reason: z.string() }).transform(c => ({ id: c.checkId.value, status: c.status, reason: c.reason }))) })) }),
  decisions: z.array(z.object({ checkId: z.object({ value: id }), passed: z.boolean(), justification: z.string() }).transform(d => ({ ...d, checkId: d.checkId.value }))),
});
const estimate = z.object({ id, status: z.enum(['COMPLETE', 'PARTIAL']), officialGrade: z.literal(false), maxScore: z.literal(20), estimatedScore: points.nullable(), estimatedSubtotal: points, coveredMaxPoints: points, summary: z.string(), criteria: z.array(z.object({ criterionId: id, estimatedPoints: points.nullable(), justification: z.string() })) });
const page = <T extends z.ZodType>(item: T) => z.object({ items: z.array(item), page: z.number().int().nonnegative(), size: z.number().int().positive(), hasNext: z.boolean() });
const root = '/me/evaluations';
const project = (value: string) => `${root}/projects/${encodeURIComponent(value)}`;
const optionIndex = z.number().int().min(0).max(3);
const practiceTest = z.object({
  id, correctCount: z.number().int().min(0).max(3).nullable(),
  questions: z.array(z.object({
    prompt: z.string(), options: z.array(z.string()).length(4),
    selectedOption: optionIndex.nullable(), correctOption: optionIndex.nullable(),
    explanation: z.string().nullable(),
  })).length(3),
});

export class EvaluationApiService implements EvaluationRepositoryPort {
  async practice(projectId: string, signal?: AbortSignal) {
    return z.object({ canGenerate: z.boolean(), tests: z.array(practiceTest) })
      .parse(await this.http.get<unknown>(`${project(projectId)}/practice`, signal));
  }
  async generatePractice(projectId: string) {
    return practiceTest.parse(await this.http.post<unknown>(`${project(projectId)}/practice`, {}));
  }
  async submitPractice(projectId: string, testId: string, answers: number[]) {
    return practiceTest.parse(await this.http.post<unknown>(
      `${project(projectId)}/practice/${encodeURIComponent(testId)}/submit`, { answers },
    ));
  }
  async pipelineRuns(projectId: string, pageNumber: number, signal?: AbortSignal) {
    const path = `/v1/pipeline-runs/projects/${encodeURIComponent(projectId)}?page=${pageNumber}&size=20`;
    return z.array(z.object({
      id,
      repository: z.string(),
      workflowName: z.string(),
      branch: z.string(),
      commitSha: z.string(),
      status: z.string(),
      conclusion: z.string().nullable(),
      attempt: z.number().int().positive(),
      runUrl: z.url({ protocol: /^https?$/ }),
      createdAt: z.iso.datetime({ offset: true }),
      startedAt: z.iso.datetime({ offset: true }).nullish(),
      completedAt: z.iso.datetime({ offset: true }).nullish(),
      sonarAnalysis: z.object({ qualityGateStatus: z.string() }).nullable(),
    })).parse(await this.http.get<unknown>(path, signal));
  }
  async archiveRubric(courseId: string, rubricId: string): Promise<void> {
    await this.http.post(`${root}/courses/${encodeURIComponent(courseId)}/rubrics/${encodeURIComponent(rubricId)}/archive`, {});
  }
  async analyzeRubricDocument(courseId: string, text: string) {
    const path = `${root}/courses/${encodeURIComponent(courseId)}/rubrics/document-analysis`;
    return z.object({ title: z.string(), criteria: z.array(z.object({
      description: z.string(), objective: z.string(), maxPoints: z.number().nullable(),
    })).max(100) }).parse(await this.http.post<unknown>(path, { text }));
  }
  async proposeRubric(courseId: string, rubricId: string, version: number, language: string) {
    const path = `${root}/courses/${encodeURIComponent(courseId)}/rubrics/${encodeURIComponent(rubricId)}/versions/${version}/technical-proposal`;
    return z.object({ id, checks: z.array(z.object({
      criterionId: id, mechanism: z.string(), target: z.string(), rationale: z.string(),
      parameters: z.record(z.string(), z.string()),
    })) }).parse(await this.http.post<unknown>(path, { language }));
  }
  readRubricDocument = readRubricDocument;
  constructor(private readonly http: HttpClient) {}
  async courses(n: number, signal?: AbortSignal) {
    return page(z.object({ id, name: z.string(), section: z.string(), academicPeriod: z.string() })).parse(await this.http.get<unknown>(`${root}/catalog/courses?page=${n}&size=100`, signal));
  }
  async projects(courseId: string, n: number, signal?: AbortSignal) {
    return page(z.object({ id, courseId: id, name: z.string(), organizationLogin: z.string().nullable() })).parse(await this.http.get<unknown>(`${root}/catalog/courses/${encodeURIComponent(courseId)}/projects?page=${n}&size=100`, signal));
  }
  async repositories(p: string, signal?: AbortSignal) {
    return z.array(z.object({ id: z.number().int().positive(), fullName: z.string(), gitRef: z.string(), lastAnalyzedAt: z.string() })).parse(await this.http.get<unknown>(`${project(p)}/repositories`, signal));
  }
  async rubrics(p: string, n: number, signal?: AbortSignal) { return z.array(rubric).parse(await this.http.get<unknown>(`${root}/courses/${encodeURIComponent(p)}/rubrics?page=${n}&size=100`, signal)); }
  async configurations(p: string, repositoryId: number, signal?: AbortSignal) { return z.array(configuration).parse(await this.http.get<unknown>(`${project(p)}/configurations?repositoryId=${repositoryId}`, signal)); }
  async configuration(p: string, key: string, signal?: AbortSignal) { return configuration.parse(await this.http.get<unknown>(`${project(p)}/configurations/${encodeURIComponent(key)}`, signal)); }
  async publish(p: string, input: PublishRubricInput, previousId?: string) { return rubric.parse(await this.http.post<unknown>(`${root}/courses/${encodeURIComponent(p)}/rubrics${previousId ? `/${encodeURIComponent(previousId)}/versions` : ''}`, input)); }
  async courseGate(courseId: string, signal?: AbortSignal) {
    const schema = z.array(z.object({ rubric, checks: z.array(check) }));
    return schema.parse(await this.http.get<unknown>(`${root}/courses/${encodeURIComponent(courseId)}/rubrics/quality-gate`, signal))[0];
  }
  async approveCourseGate(courseId: string, input: ApproveEvaluationInput) {
    await this.http.post<unknown>(`${root}/courses/${encodeURIComponent(courseId)}/rubrics/quality-gate`, input);
  }
  async gate(p: string, key: string, signal?: AbortSignal) { return gate.parse(await this.http.get<unknown>(`${project(p)}/configurations/${encodeURIComponent(key)}/quality-gate`, signal)); }
  async retryGate(p: string, key: string) { return gate.parse(await this.http.post<unknown>(`${project(p)}/configurations/${encodeURIComponent(key)}/quality-gate/retry`, {})); }
  async analyses(p: string, repository: EvaluationRepository, n: number, signal?: AbortSignal) { return z.array(analysis).parse(await this.http.get<unknown>(`${project(p)}/analyses?repositoryId=${repository.id}&gitRef=${encodeURIComponent(repository.gitRef)}&page=${n}&size=20`, signal)); }
  async evaluations(p: string, repositoryId: number, n: number, signal?: AbortSignal) { return z.array(evaluation).parse(await this.http.get<unknown>(`${project(p)}/evaluations?repositoryId=${repositoryId}&page=${n}&size=20`, signal)); }
  async evaluate(p: string, configurationId: string, eventId: string) { return evaluation.parse(await this.http.post<unknown>(`${project(p)}/evaluations`, { configurationId, eventId })); }
  async evidence(p: string, key: string, signal?: AbortSignal) { return z.object({ reference: analysis, evidence: z.object({ state: z.string(), measures: z.record(z.string(), z.number()) }) }).parse(await this.http.get<unknown>(`${project(p)}/evaluations/${encodeURIComponent(key)}/analysis`, signal)); }
  async estimate(p: string, key: string, signal?: AbortSignal) {
    try { return estimate.parse(await this.http.get<unknown>(`${project(p)}/evaluations/${encodeURIComponent(key)}/grade-estimate`, signal)); }
    catch (error) { if (error instanceof HttpError && error.status === 404) return null; throw error; }
  }
  async generateEstimate(p: string, key: string) { return estimate.parse(await this.http.post<unknown>(`${project(p)}/evaluations/${encodeURIComponent(key)}/grade-estimate`, {})); }
  async review(p: string, key: string, input: { checkId: string; passed: boolean; justification: string }) { return evaluation.parse(await this.http.post<unknown>(`${project(p)}/evaluations/${encodeURIComponent(key)}/manual-reviews`, input)); }
}
