import { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ArchiveRubricUseCase,
  DeleteRubricUseCase,
  DuplicateRubricUseCase,
  GetRubricLibraryUseCase,
  GetStudentRubricUseCase,
  PreviewRubricImportUseCase,
  PublishRubricUseCase,
  SaveRubricDraftUseCase,
} from '../../application/rubric.use-cases';
import type { RubricDraft, UploadMetadata } from '../../domain/rubric';
export interface RubricDependencies {
  library: GetRubricLibraryUseCase;
  save: SaveRubricDraftUseCase;
  publish: PublishRubricUseCase;
  duplicate: DuplicateRubricUseCase;
  archive: ArchiveRubricUseCase;
  remove: DeleteRubricUseCase;
  importPreview: PreviewRubricImportUseCase;
  student: GetStudentRubricUseCase;
}
export const RubricContext = createContext<RubricDependencies | null>(null);
function useRubricCases() {
  const value = useContext(RubricContext);
  if (!value) throw new Error('RubricContext es obligatorio');
  return value;
}
export const rubricKeys = {
  library: ['rubrics', 'library'] as const,
  student: ['rubrics', 'assigned'] as const,
};
export function useRubricLibrary() {
  const cases = useRubricCases();
  return useQuery({
    queryKey: rubricKeys.library,
    queryFn: ({ signal }) => cases.library.execute(signal),
  });
}
export function useStudentRubric() {
  const cases = useRubricCases();
  return useQuery({
    queryKey: rubricKeys.student,
    queryFn: ({ signal }) => cases.student.execute(signal),
  });
}
export function useRubricActions() {
  const cases = useRubricCases();
  const client = useQueryClient();
  const refresh = () =>
    client.invalidateQueries({ queryKey: rubricKeys.library });
  return {
    save: useMutation({
      mutationFn: ({ draft, id }: { draft: RubricDraft; id?: string }) =>
        cases.save.execute(draft, id),
      onSuccess: refresh,
    }),
    publish: useMutation({
      mutationFn: (id: string) => cases.publish.execute(id),
      onSuccess: refresh,
    }),
    duplicate: useMutation({
      mutationFn: (id: string) => cases.duplicate.execute(id),
      onSuccess: refresh,
    }),
    archive: useMutation({
      mutationFn: (id: string) => cases.archive.execute(id),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => cases.remove.execute(id),
      onSuccess: refresh,
    }),
    importPreview: useMutation({
      mutationFn: (metadata: UploadMetadata) =>
        cases.importPreview.execute(metadata),
    }),
  };
}
