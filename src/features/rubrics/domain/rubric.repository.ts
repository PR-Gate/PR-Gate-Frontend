import type {
  Rubric,
  RubricDraft,
  RubricLibrary,
  StudentRubric,
  UploadMetadata,
} from './rubric';
export interface RubricRepository {
  library(signal?: AbortSignal): Promise<RubricLibrary>;
  save(draft: RubricDraft, id?: string): Promise<Rubric>;
  publish(id: string): Promise<Rubric>;
  duplicate(id: string): Promise<Rubric>;
  archive(id: string): Promise<Rubric>;
  remove(id: string): Promise<void>;
  importPreview(metadata: UploadMetadata): Promise<RubricDraft>;
  student(signal?: AbortSignal): Promise<StudentRubric | null>;
}
