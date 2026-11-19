import { createContext, useContext } from 'react';
import type { EvaluationUseCases } from '../../application/use-cases/evaluation.use-cases';

export const EvaluationContext = createContext<EvaluationUseCases | null>(null);
export function useEvaluationApi() {
  const value = useContext(EvaluationContext);
  if (!value) throw new Error('EvaluationContext es obligatorio');
  return value.repository;
}
