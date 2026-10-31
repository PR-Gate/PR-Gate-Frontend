import type { AssessmentRepository } from '../domain/assessment.repository';
import type { ReviewInput, TestDraft } from '../domain/assessment';
import type { AssessmentApiService } from './assessment-api.service';
import { mapAssessment } from './assessment.mapper';
export class AssessmentRepositoryImpl implements AssessmentRepository {
  constructor(private readonly api: AssessmentApiService) {}
  async list(signal?: AbortSignal) {
    const dto = await this.api.list(signal);
    return {
      tests: dto.data.map(mapAssessment),
      publishedCount: dto.summary.published,
      pendingResponses: dto.summary.pending_responses,
      pendingReview: dto.summary.pending_review,
    };
  }
  async get(id: string, signal?: AbortSignal) {
    return mapAssessment(await this.api.get(id, signal));
  }
  catalog(signal?: AbortSignal) {
    return this.api.catalog(signal);
  }
  async save(input: TestDraft, id?: string) {
    return mapAssessment(await this.api.save(input, id));
  }
  async publish(id: string) {
    return mapAssessment(await this.api.publish(id));
  }
  remind(id: string, participantId?: string) {
    return this.api.remind(id, participantId);
  }
  async review(id: string, input: ReviewInput) {
    return mapAssessment(await this.api.review(id, input));
  }
}
