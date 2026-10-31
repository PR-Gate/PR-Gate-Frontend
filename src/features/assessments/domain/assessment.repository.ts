import type {
  Assessment,
  AssessmentCatalog,
  AssessmentList,
  ReviewInput,
  TestDraft,
} from './assessment';
export interface AssessmentRepository {
  list(signal?: AbortSignal): Promise<AssessmentList>;
  get(id: string, signal?: AbortSignal): Promise<Assessment>;
  catalog(signal?: AbortSignal): Promise<AssessmentCatalog>;
  save(input: TestDraft, id?: string): Promise<Assessment>;
  publish(id: string): Promise<Assessment>;
  remind(id: string, participantId?: string): Promise<{ recipients: number }>;
  review(id: string, input: ReviewInput): Promise<Assessment>;
}
