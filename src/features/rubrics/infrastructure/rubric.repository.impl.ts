import type { RubricRepository } from '../domain/rubric.repository';
import type { RubricDraft, UploadMetadata } from '../domain/rubric';
import type { RubricApiService } from './rubric-api.service';
import { mapRubric, mapStudentRubric } from './rubric.mapper';
export class RubricRepositoryImpl implements RubricRepository {
  constructor(private readonly api: RubricApiService) {}
  async library(signal?: AbortSignal) {
    const dto = await this.api.library(signal);
    return { rubrics: dto.data.map(mapRubric), courses: dto.courses };
  }
  async save(draft: RubricDraft, id?: string) {
    return mapRubric(await this.api.save(draft, id));
  }
  async publish(id: string) {
    return mapRubric(await this.api.action(id, 'publish'));
  }
  async duplicate(id: string) {
    return mapRubric(await this.api.action(id, 'duplicate'));
  }
  async archive(id: string) {
    return mapRubric(await this.api.action(id, 'archive'));
  }
  remove(id: string) {
    return this.api.remove(id);
  }
  importPreview(metadata: UploadMetadata) {
    return this.api.importPreview(metadata);
  }
  async student(signal?: AbortSignal) {
    const dto = await this.api.student(signal);
    return dto ? mapStudentRubric(dto) : null;
  }
}
