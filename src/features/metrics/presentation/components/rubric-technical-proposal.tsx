import { useState } from 'react';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import type {
  PublishedRubric,
  TechnicalProposal,
} from '../../domain/evaluation';
import { useEvaluationApi } from '../hooks/use-evaluation';
import { EvaluationError } from './evaluation-feedback';

export function useRubricProposal(rubric?: PublishedRubric) {
  const { user } = useAuth();
  const key = [
    'rubric-proposal',
    user?.id,
    rubric?.id,
    rubric?.version,
  ] as const;
  const query = useQuery<TechnicalProposal>({
    queryKey: key,
    queryFn: skipToken,
    staleTime: Infinity,
  });
  return { key, proposal: query.data };
}

export function RubricTechnicalProposal({
  courseId,
  rubric,
}: {
  courseId: string;
  rubric: PublishedRubric;
}) {
  const api = useEvaluationApi();
  const client = useQueryClient();
  const { key, proposal } = useRubricProposal(rubric);
  const [language, setLanguage] = useState('');
  const generate = useMutation({
    mutationFn: () =>
      api.proposeRubric(courseId, rubric.id, rubric.version, language.trim()),
    onSuccess: (value) => client.setQueryData(key, value),
  });
  return (
    <div className="evaluation-form">
      <label>
        Lenguaje del código
        <input
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          maxLength={40}
          placeholder="Ej. Python"
          disabled={generate.isPending}
        />
      </label>
      <Button
        type="button"
        disabled={!language.trim() || generate.isPending}
        onClick={() => generate.mutate()}
      >
        {generate.isPending
          ? 'Preparando propuesta…'
          : 'Proponer criterios con IA'}
      </Button>
      {generate.isError && <EvaluationError />}
      {proposal && (
        <div>
          <p>
            Revisa estas sugerencias. Puedes usar las métricas compatibles al
            configurar el repositorio.
          </p>
          <ul>
            {proposal.checks.map((check, index) => (
              <li key={index} className="evaluation-criterion-result">
                <div>
                  <strong>
                    {
                      rubric.criteria.find(
                        (criterion) => criterion.id === check.criterionId,
                      )?.description
                    }
                  </strong>
                  <p>
                    {check.target} · {check.rationale}
                  </p>
                  {Object.keys(check.parameters).length > 0 && (
                    <p>
                      {Object.entries(check.parameters)
                        .map(([name, value]) => `${name}: ${value}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
