import type { HttpClient } from '@/shared/services/http/http-client';
import type { RubricDraft, UploadMetadata } from '../domain/rubric';
import {
  rubricDraftSchema,
  rubricDtoSchema,
  rubricLibrarySchema,
  studentRubricSchema,
} from './rubric.dto';
const root = '/demo/rubrics';
export class RubricApiService {
  constructor(private readonly http: HttpClient) {}
  async library(signal?: AbortSignal) {
    return rubricLibrarySchema.parse(
      await this.http.get<unknown>(root, signal),
    );
  }
  async save(draft: RubricDraft, id?: string) {
    return rubricDtoSchema.parse(
      await this.http.post<unknown>(
        id ? `${root}/${encodeURIComponent(id)}/draft` : root,
        draft,
      ),
    );
  }
  async action(id: string, action: 'publish' | 'duplicate' | 'archive') {
    return rubricDtoSchema.parse(
      await this.http.post<unknown>(
        `${root}/${encodeURIComponent(id)}/${action}`,
        {},
      ),
    );
  }
  async remove(id: string) {
    await this.http.post<unknown>(
      `${root}/${encodeURIComponent(id)}/delete`,
      {},
    );
  }
  async importPreview(metadata: UploadMetadata) {
    return rubricDraftSchema.parse(
      await this.http.post<unknown>(`${root}/import-preview`, metadata),
    );
  }
  async student(signal?: AbortSignal) {
    return studentRubricSchema.parse(
      await this.http.get<unknown>(`${root}/assigned`, signal),
    );
  }
}
