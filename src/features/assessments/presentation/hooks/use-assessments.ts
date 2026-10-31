import { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  GetTestCatalogUseCase,
  GetTestsUseCase,
  GetTestUseCase,
  PublishTestUseCase,
  RemindTestUseCase,
  ReviewTestUseCase,
  SaveTestDraftUseCase,
} from '../../application/assessment.use-cases';
import type { ReviewInput, TestDraft } from '../../domain/assessment';
export interface AssessmentDependencies {
  list: GetTestsUseCase;
  get: GetTestUseCase;
  catalog: GetTestCatalogUseCase;
  save: SaveTestDraftUseCase;
  publish: PublishTestUseCase;
  remind: RemindTestUseCase;
  review: ReviewTestUseCase;
}
export const AssessmentContext = createContext<AssessmentDependencies | null>(
  null,
);
function useCases() {
  const value = useContext(AssessmentContext);
  if (!value) throw new Error('AssessmentContext es obligatorio');
  return value;
}
export const assessmentKeys = {
  all: ['assessments'] as const,
  list: ['assessments', 'list'] as const,
  detail: (id: string) => ['assessments', 'detail', id] as const,
  catalog: ['assessment-catalog'] as const,
};
export function useTests() {
  const service = useCases();
  return useQuery({
    queryKey: assessmentKeys.list,
    queryFn: ({ signal }) => service.list.execute(signal),
  });
}
export function useTest(id: string) {
  const service = useCases();
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: ({ signal }) => service.get.execute(id, signal),
    enabled: Boolean(id),
  });
}
export function useTestCatalog() {
  const service = useCases();
  return useQuery({
    queryKey: assessmentKeys.catalog,
    queryFn: ({ signal }) => service.catalog.execute(signal),
  });
}
export function useTestActions() {
  const service = useCases();
  const client = useQueryClient();
  const invalidate = () =>
    client.invalidateQueries({ queryKey: assessmentKeys.all });
  return {
    save: useMutation({
      mutationFn: ({ input, id }: { input: TestDraft; id?: string }) =>
        service.save.execute(input, id),
      onSuccess: invalidate,
    }),
    publish: useMutation({
      mutationFn: (id: string) => service.publish.execute(id),
      onSuccess: invalidate,
    }),
    remind: useMutation({
      mutationFn: ({
        id,
        participantId,
      }: {
        id: string;
        participantId?: string;
      }) => service.remind.execute(id, participantId),
      onSuccess: invalidate,
    }),
    review: useMutation({
      mutationFn: ({ id, input }: { id: string; input: ReviewInput }) =>
        service.review.execute(id, input),
      onSuccess: invalidate,
    }),
  };
}
