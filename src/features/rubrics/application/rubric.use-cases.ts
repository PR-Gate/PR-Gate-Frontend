import type { RubricRepository } from '../domain/rubric.repository';
import type { RubricDraft, UploadMetadata } from '../domain/rubric';
export class GetRubricLibraryUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(signal?: AbortSignal) {
    return this.repository.library(signal);
  }
}
export class SaveRubricDraftUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(draft: RubricDraft, id?: string) {
    return this.repository.save(draft, id);
  }
}
export class PublishRubricUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(id: string) {
    return this.repository.publish(id);
  }
}
export class DuplicateRubricUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(id: string) {
    return this.repository.duplicate(id);
  }
}
export class ArchiveRubricUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(id: string) {
    return this.repository.archive(id);
  }
}
export class DeleteRubricUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(id: string) {
    return this.repository.remove(id);
  }
}
export class PreviewRubricImportUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(metadata: UploadMetadata) {
    return this.repository.importPreview(metadata);
  }
}
export class GetStudentRubricUseCase {
  constructor(private readonly repository: RubricRepository) {}
  execute(signal?: AbortSignal) {
    return this.repository.student(signal);
  }
}
