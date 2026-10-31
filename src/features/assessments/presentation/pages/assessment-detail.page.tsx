import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import type { Participant } from '../../domain/assessment';
import {
  useTest,
  useTestActions,
  useTestCatalog,
} from '../hooks/use-assessments';
import { TestStatusBadge } from '../components/test-status';
import { responseLabels, testDate } from '../test-labels';
import { ResponseReview } from '../components/response-review';
import { TestWizard } from '../components/test-wizard';
import '../styles/assessments.css';
const tabs = ['Resumen', 'Preguntas', 'Estudiantes', 'Resultados'];
export default function AssessmentDetailPage() {
  const { testId = '' } = useParams();
  const query = useTest(testId);
  const catalog = useTestCatalog();
  const actions = useTestActions();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(() =>
    params.get('tab') === 'students'
      ? 2
      : params.get('tab') === 'results'
        ? 3
        : 0,
  );
  const [review, setReview] = useState<Participant | null>(null);
  const [edit, setEdit] = useState(false);
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  const test = query.data;
  const remind = async (participantId: string) => {
    try {
      const result = await actions.remind.mutateAsync({
        id: test.id,
        participantId,
      });
      toast.success(
        `Recordatorio simulado registrado para ${result.recipients} alumno. No se envió correo real.`,
      );
    } catch {
      toast.error('No se pudo registrar el recordatorio.');
    }
  };
  return (
    <section className="assessments-page">
      <Link to="/teacher/evaluations" className="test-back">
        <ArrowLeft size={16} />
        Mis tests
      </Link>
      <div className="test-page-heading">
        <div>
          <TestStatusBadge status={test.status} />
          <h1>{test.title}</h1>
          <p>
            {test.courseName} — Sección {test.section}
          </p>
        </div>
        {['draft', 'scheduled'].includes(test.status) && (
          <Button disabled={!catalog.data} onClick={() => setEdit(true)}>
            {test.status === 'draft'
              ? 'Continuar editando'
              : 'Editar programación'}
          </Button>
        )}
      </div>
      <p className="test-demo-note">
        Demostración · Datos simulados · La decisión final de evaluación
        corresponde al docente.
      </p>
      <dl className="test-meta">
        {[
          ['Fecha límite · Lima', testDate(test.closesAt)],
          ['Duración', `${test.durationMinutes} minutos`],
          ['Preguntas', test.questions.length],
          ['Puntaje total', test.totalPoints],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div role="tablist" aria-label="Detalle del test" className="test-tabs">
        {tabs.map((label, index) => (
          <button
            key={label}
            id={`test-tab-${index}`}
            role="tab"
            aria-selected={tab === index}
            aria-controls={`test-panel-${index}`}
            tabIndex={tab === index ? 0 : -1}
            onClick={() => setTab(index)}
            onKeyDown={(event) => {
              if (
                ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? tabs.length - 1
                      : (index +
                          (event.key === 'ArrowRight' ? 1 : -1) +
                          tabs.length) %
                        tabs.length;
                setTab(next);
                document.getElementById(`test-tab-${next}`)?.focus();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`test-panel-${tab}`}
        aria-labelledby={`test-tab-${tab}`}
        className="test-panel"
      >
        {tab === 0 && (
          <>
            <h2>Participación del curso</h2>
            <div className="test-summary">
              {[
                ['Estudiantes asignados', test.assignedCount],
                ['Respuestas recibidas', test.respondedCount],
                ['Alumnos por responder', test.pendingResponses],
                ['Respuestas por revisar', test.pendingReview],
              ].map(([label, value]) => (
                <div key={label}>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <progress
              aria-label="Participación del curso"
              max={test.assignedCount || 1}
              value={test.respondedCount}
            />
            <p className="test-subtle">
              {test.respondedCount} de {test.assignedCount} alumnos
              respondieron.
            </p>
            {test.instructions && (
              <p className="test-answer">{test.instructions}</p>
            )}
            {test.status === 'draft' && (
              <p className="assessment-notice">
                Este borrador aún no se ha enviado a los alumnos.
              </p>
            )}
          </>
        )}
        {tab === 1 && (
          <>
            <h2>
              {test.questions.length} preguntas · {test.totalPoints} puntos en
              total
            </h2>
            {!test.questions.length ? (
              <p className="test-subtle">
                Agrega preguntas desde “Continuar editando”.
              </p>
            ) : (
              <ol className="test-question-list">
                {test.questions.map((question, index) => (
                  <li key={question.id}>
                    <div>
                      <h3>
                        {index + 1}. {question.prompt}
                      </h3>
                      <p>{question.points} puntos</p>
                      {question.kind === 'open' ? (
                        <p className="assessment-notice">
                          Requiere revisión docente
                        </p>
                      ) : (
                        <ul>
                          {question.options.map((option, position) => (
                            <li key={position}>
                              {option}
                              {question.correctAnswer === String(position)
                                ? ' · Respuesta de referencia'
                                : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                      {question.feedback && (
                        <p className="test-subtle">
                          Retroalimentación: {question.feedback}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
        {tab === 2 && (
          <>
            <h2>Estudiantes y respuestas</h2>
            {!test.participants.length ? (
              <EmptyState
                title="Sin alumnos asignados"
                description="Continúa editando el borrador para elegirlos."
              />
            ) : (
              <div className="test-student-table">
                <table>
                  <thead>
                    <tr>
                      {[
                        'Estudiante',
                        'Estado',
                        'Fecha de entrega · Lima',
                        'Puntaje',
                        'Acción',
                      ].map((label) => (
                        <th scope="col" key={label}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {test.participants.map((participant) => (
                      <tr key={participant.id}>
                        <th scope="row">{participant.name}</th>
                        <td>
                          <span
                            className={`test-badge response-${participant.status}`}
                          >
                            {responseLabels[participant.status]}
                          </span>
                        </td>
                        <td>
                          {participant.submittedAt
                            ? testDate(participant.submittedAt)
                            : 'Respuesta pendiente'}
                        </td>
                        <td>
                          {participant.score === null
                            ? 'Pendiente de confirmación'
                            : `${participant.score} / ${test.totalPoints}`}
                        </td>
                        <td>
                          {['not_started', 'in_progress'].includes(
                            participant.status,
                          ) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                actions.remind.isPending ||
                                test.status !== 'published'
                              }
                              onClick={() => {
                                void remind(participant.id);
                              }}
                            >
                              <Send size={12} />
                              Enviar recordatorio
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReview(participant)}
                            >
                              {participant.status === 'graded'
                                ? 'Ver resultado'
                                : participant.status === 'needs_review'
                                  ? 'Revisar'
                                  : 'Ver respuesta'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {tab === 3 && (
          <>
            <h2>Resultados generales</h2>
            <p className="assessment-notice">
              Solo las calificaciones confirmadas por el docente se incluyen en
              el promedio. Las preguntas abiertas requieren revisión docente.
            </p>
            <div className="test-summary">
              <div>
                <p>Promedio del curso</p>
                <strong>
                  {test.results.average === null
                    ? 'Sin calificaciones confirmadas'
                    : `${test.results.average.toLocaleString('es-PE', { maximumFractionDigits: 2 })} / ${test.totalPoints}`}
                </strong>
              </div>
              <div>
                <p>Participación</p>
                <strong>
                  {test.results.participation.toLocaleString('es-PE', {
                    maximumFractionDigits: 1,
                  })}
                  %
                </strong>
              </div>
            </div>
            <div className="test-results-grid">
              <article>
                <h3>Preguntas con mayor dificultad</h3>
                {test.results.difficultQuestions.length ? (
                  <ul>
                    {test.results.difficultQuestions.map((item) => (
                      <li key={item.label}>
                        <strong>{item.label}</strong>
                        <p>{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aún no hay información suficiente.</p>
                )}
              </article>
              <article>
                <h3>Distribución de puntajes</h3>
                {test.results.distribution.length ? (
                  <ul>
                    {test.results.distribution.map((item) => (
                      <li key={item.label}>
                        {item.label}: <strong>{item.count}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aún no hay calificaciones confirmadas.</p>
                )}
              </article>
              <article>
                <h3>Alumnos que podrían necesitar apoyo</h3>
                {test.results.support.length ? (
                  <ul>
                    {test.results.support.map((item) => (
                      <li key={item.name}>
                        <strong>{item.name}</strong>
                        <p>Requiere acompañamiento · {item.reason}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay recomendaciones disponibles.</p>
                )}
              </article>
            </div>
          </>
        )}
      </div>
      {review && (
        <ResponseReview
          key={review.id}
          test={test}
          participant={review}
          onClose={() => setReview(null)}
        />
      )}
      {edit && catalog.data && (
        <TestWizard
          existing={test}
          catalog={catalog.data}
          onClose={() => setEdit(false)}
          onSaved={() => setEdit(false)}
        />
      )}
      {catalog.isError && (
        <ErrorState
          error={catalog.error}
          retry={() => {
            void catalog.refetch();
          }}
        />
      )}
    </section>
  );
}
