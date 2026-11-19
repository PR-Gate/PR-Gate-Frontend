import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ErrorState } from '@/shared/components/feedback/async-state';
import { useAuth } from '@/shared/services/auth/auth-context';
import { useActiveProject } from '@/features/projects/presentation/hooks/use-active-project';
import { useEvaluationApi } from '@/features/metrics/presentation/hooks/use-evaluation';
import type { PracticeTest } from '@/features/metrics/domain/evaluation';
import { StudentTestSummary } from '../components/student-test-summary';

export function LiveStudentTestsPage() {
  const { active, catalog } = useActiveProject();
  return (
    <section className="student-tests">
      <header className="student-tests-heading">
        <p className="eyebrow">REFUERZO PERSONALIZADO</p>
        <h1>Mis tests</h1>
        <p>{active ? active.name : 'Selecciona un proyecto en la barra lateral para ver sus tests.'}</p>
      </header>
      {catalog.isPending && <p role="status">Cargando tus proyectos…</p>}
      {catalog.isError && <ErrorState error={catalog.error} retry={() => void catalog.refetch()} />}
      {active && <ProjectPractice key={active.id} projectId={active.id} />}
    </section>
  );
}

function ProjectPractice({ projectId }: { projectId: string }) {
  const api = useEvaluationApi();
  const { user } = useAuth();
  const client = useQueryClient();
  const queryKey = ['student-practice', user?.id, projectId];
  const query = useQuery({ queryKey, queryFn: ({ signal }) => api.practice(projectId, signal) });
  const refresh = () => client.invalidateQueries({ queryKey });
  const generate = useMutation({ mutationFn: () => api.generatePractice(projectId), onSuccess: refresh });
  const submit = useMutation({
    mutationFn: ({ test, answers }: { test: PracticeTest; answers: number[] }) =>
      api.submitPractice(projectId, test.id, answers),
    onSuccess: refresh,
  });
  if (query.isPending) return <p role="status">Cargando tests…</p>;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const pending = query.data.tests.filter((test) => test.correctCount === null);
  const completed = query.data.tests.filter((test) => test.correctCount !== null);
  const mean = completed.length
    ? new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 }).format(
        completed.reduce((sum, test) => sum + (test.correctCount ?? 0) / test.questions.length, 0) / completed.length,
      )
    : '—';
  function send(event: FormEvent<HTMLFormElement>, test: PracticeTest) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = test.questions.map((_, index) => data.get(`question-${index}`));
    if (selected.some((answer) => answer === null)) return;
    submit.mutate({ test, answers: selected.map(Number) });
  }

  return (
    <>
      <StudentTestSummary values={[String(pending.length), String(completed.length), mean]} />
      <section className="space-y-3" aria-labelledby="pending-practice">
        <div className="student-tests-section-heading flex flex-wrap items-center justify-between gap-3">
          <h2 id="pending-practice">Pendientes</h2>
          {query.data.canGenerate && <Button disabled={generate.isPending} onClick={() => generate.mutate()}>
            {generate.isPending ? 'Generando test…' : 'Generar test de refuerzo'}
          </Button>}
        </div>
        {generate.isError && <p role="alert" className="text-sm text-red-700">No se pudo generar el test. Inténtalo de nuevo.</p>}
        {!pending.length && <p className="student-tests-panel p-5 text-sm text-muted-foreground">
          {query.data.canGenerate ? 'Puedes generar un test a partir de los hallazgos de la última evaluación.' : 'No hay tests pendientes ni hallazgos nuevos para practicar.'}
        </p>}
        {pending.map((test) => (
          <form key={test.id} className="student-tests-panel student-tests-pending space-y-4 p-6"
            onSubmit={(event) => send(event, test)}>
            <fieldset disabled={submit.isPending} className="space-y-4">
              <legend className="font-semibold">Refuerzo técnico</legend>
              {test.questions.map((question, index) => (
                <fieldset key={question.prompt} className="space-y-2 text-sm">
                  <legend className="mb-2 font-medium">{index + 1}. {question.prompt}</legend>
                  {question.options.map((option, choice) => (
                    <label key={option} className="flex items-start gap-2">
                      <input type="radio" className="mt-1 accent-primary" name={`question-${index}`} value={choice} required />
                      {option}
                    </label>
                  ))}
                </fieldset>
              ))}
              <Button type="submit">{submit.isPending ? 'Guardando…' : 'Enviar respuestas'}</Button>
            </fieldset>
            {submit.isError && submit.variables?.test.id === test.id && (
              <p role="alert" className="text-sm text-red-700">No se pudieron guardar las respuestas. Inténtalo de nuevo.</p>
            )}
          </form>
        ))}
      </section>
      <section className="space-y-3" aria-labelledby="completed-practice">
        <div className="student-tests-section-heading"><h2 id="completed-practice">Completados</h2></div>
        {!completed.length && <p className="student-tests-panel p-5 text-sm text-muted-foreground">Aún no has completado ningún test.</p>}
        {completed.map((test) => (
          <details key={test.id} className="student-tests-panel p-5 text-sm">
            <summary className="cursor-pointer font-semibold">Refuerzo técnico · {test.correctCount} de {test.questions.length} correctas</summary>
            <ol className="mt-4 list-decimal space-y-4 pl-5">
              {test.questions.map((question) => (
                <li key={question.prompt}>
                  <p className="font-medium">{question.prompt}</p>
                  <p>Tu respuesta · {question.options[question.selectedOption ?? -1]}</p>
                  <p>Respuesta correcta · {question.options[question.correctOption ?? -1]}</p>
                  <p className="text-muted-foreground">{question.explanation}</p>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </section>
    </>
  );
}
