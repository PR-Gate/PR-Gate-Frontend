import type { EvaluationRepositoryPort } from '../../domain/evaluation';

/** Authorization, scoring and gate configuration are exclusively backend responsibilities. */
export class EvaluationUseCases {
  constructor(readonly repository: EvaluationRepositoryPort) {}
}
