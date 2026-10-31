import type { AssessmentRepository } from '../domain/assessment.repository';
import type { ReviewInput, TestDraft } from '../domain/assessment';
// One explicit operation per use case, composed manually in app/di.
export class GetTestsUseCase {
  constructor(private readonly repository: AssessmentRepository) {}
  execute(signal?: AbortSignal) {
    return this.repository.list(signal);
  }
}
export class GetTestUseCase {
  constructor(private readonly repository: AssessmentRepository) {}
  execute(id: string, signal?: AbortSignal) {
    return this.repository.get(id, signal);
  }
}
export class GetTestCatalogUseCase {
  constructor(private readonly repository: AssessmentRepository) {}
  execute(signal?: AbortSignal) {
    return this.repository.catalog(signal);
  }
}
export class SaveTestDraftUseCase {
  constructor(private readonly repository: AssessmentRepository) {}
  execute(input: TestDraft, id?: string) {
    return this.repository.save(input, id);
  }
}
export class PublishTestUseCase {
  constructor(private readonly repository: AssessmentRepository) {}
  execute(id: string) {
    return this.repository.publish(id);
  }
}
export class RemindTestUseCase {
  constructor(private readonly repository: AssessmentRepository) {}
  execute(id: string, participantId?: string) {
    return this.repository.remind(id, participantId);
  }
}
export class ReviewTestUseCase {
  constructor(private readonly repository: AssessmentRepository) {}
  execute(id: string, input: ReviewInput) {
    return this.repository.review(id, input);
  }
}
