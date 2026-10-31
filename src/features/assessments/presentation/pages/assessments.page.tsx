import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BookOpen,
  Check,
  ClipboardList,
  Plus,
  Search,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import type { Assessment } from '../../domain/assessment';
import {
  useTestActions,
  useTestCatalog,
  useTests,
} from '../hooks/use-assessments';
import { TestWizard } from '../components/test-wizard';
import { TestStatusBadge } from '../components/test-status';
import { testDate } from '../test-labels';
import '../styles/assessments.css';
export default function AssessmentsPage() {
  const query = useTests();
  const catalog = useTestCatalog();
  const actions = useTestActions();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Assessment | null | undefined>();
  const tests = (query.data?.tests ?? []).filter((test) =>
    `${test.title} ${test.courseName}`
      .toLocaleLowerCase('es')
      .includes(search.trim().toLocaleLowerCase('es')),
  );
  const remind = async (id: string) => {
    try {
      const result = await actions.remind.mutateAsync({ id });
      toast.success(
        `Recordatorio simulado para ${result.recipients} alumnos. No se envió correo real.`,
      );
    } catch {
      toast.error(
        'No se pudo registrar el recordatorio. Inténtalo nuevamente.',
      );
    }
  };
  return (
    <section className="assessments-page">
      <div className="test-page-heading">
        <div>
          <p className="eyebrow">ESPACIO DOCENTE</p>
          <h1>Tests para tus estudiantes</h1>
          <p>Crea una prueba, agrega preguntas y envíala a tu curso.</p>
        </div>
        <div className="test-header-actions">
          <label className="test-search">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Buscar test"
              placeholder="Buscar test"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Button
            disabled={!catalog.data || catalog.isError}
            onClick={() => setEditing(null)}
          >
            <Plus size={16} />
            Crear un test
          </Button>
        </div>
      </div>
      <p className="test-demo-note">
        Demostración · Datos simulados. Los cambios se conservan durante esta
        sesión del worker y se reinician al recargar.
      </p>
      <ol className="test-intro-steps">
        {[
          {
            title: 'Crea el test',
            text: 'Escribe un título y elige el curso.',
            icon: BookOpen,
          },
          {
            title: 'Agrega preguntas',
            text: 'Puedes crearlas o usar preguntas guardadas.',
            icon: ClipboardList,
          },
          {
            title: 'Envíalo a tus alumnos',
            text: 'Define la fecha y publícalo.',
            icon: Send,
          },
        ].map(({ title, text, icon: Icon }, index) => (
          <li key={title}>
            <span>
              <Icon size={18} />
            </span>
            <div>
              <h2>
                {index + 1}. {title}
              </h2>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
      {catalog.isError && (
        <ErrorState
          error={catalog.error}
          retry={() => {
            void catalog.refetch();
          }}
        />
      )}
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : (
        query.data && (
          <>
            <div className="test-stats">
              {[
                ['Tests publicados', query.data.publishedCount],
                ['Alumnos por responder', query.data.pendingResponses],
                ['Respuestas por revisar', query.data.pendingReview],
              ].map(([label, value]) => (
                <article key={label}>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
            {!tests.length ? (
              <EmptyState
                title={
                  search.trim()
                    ? 'No encontramos ese test'
                    : 'Todavía no has creado tests'
                }
                description={
                  search.trim()
                    ? 'Prueba otro nombre o curso.'
                    : 'Pulsa “Crear un test” para comenzar.'
                }
              />
            ) : (
              <ul className="test-list">
                {tests.map((test) => (
                  <li key={test.id}>
                    <div>
                      <TestStatusBadge status={test.status} />
                      <h3>
                        <Link to={`/teacher/evaluations/${test.id}`}>
                          {test.title}
                        </Link>
                      </h3>
                      <p>
                        {test.courseName} — Sección {test.section}
                      </p>
                      <p>
                        Disponible hasta el {testDate(test.closesAt)} · Lima
                      </p>
                    </div>
                    <div className="test-participation">
                      <span>
                        {test.respondedCount} de {test.assignedCount}{' '}
                        estudiantes respondieron
                      </span>
                      <progress
                        aria-label={`Progreso de ${test.title}`}
                        max={test.assignedCount || 1}
                        value={test.respondedCount}
                      />
                    </div>
                    {['draft', 'scheduled'].includes(test.status) ? (
                      <Button
                        variant="outline"
                        disabled={!catalog.data}
                        onClick={() => setEditing(test)}
                      >
                        {test.status === 'draft'
                          ? 'Continuar editando'
                          : 'Editar programación'}
                      </Button>
                    ) : (
                      <Button asChild variant="outline">
                        <Link
                          to={`/teacher/evaluations/${test.id}?tab=${test.status === 'published' ? 'students' : 'results'}`}
                        >
                          {test.status === 'published'
                            ? 'Ver respuestas'
                            : 'Ver resultados'}
                        </Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <aside className="test-today">
              <h2>¿Qué debes revisar hoy?</h2>
              {query.data.tests
                .filter(
                  (test) =>
                    test.status === 'published' && test.pendingResponses > 0,
                )
                .map((test) => (
                  <div key={test.id}>
                    <p>
                      {test.pendingResponses} estudiantes todavía no responden
                      el test “{test.title}”.
                    </p>
                    <Button
                      variant="outline"
                      disabled={actions.remind.isPending}
                      onClick={() => {
                        void remind(test.id);
                      }}
                    >
                      <Send size={14} />
                      Enviar recordatorio
                    </Button>
                  </div>
                ))}
              {query.data.pendingReview > 0 && (
                <p>
                  {query.data.pendingReview} respuestas requieren revisión
                  docente. Abre un test para revisarlas.
                </p>
              )}
              {query.data.pendingResponses === 0 &&
                query.data.pendingReview === 0 && (
                  <p className="flex items-center gap-2">
                    <Check size={16} />
                    No tienes acciones pendientes.
                  </p>
                )}
            </aside>
          </>
        )
      )}
      {editing !== undefined && catalog.data && (
        <TestWizard
          key={editing?.id ?? 'new'}
          catalog={catalog.data}
          existing={editing ?? undefined}
          onClose={() => setEditing(undefined)}
          onSaved={(id) => {
            setEditing(undefined);
            void navigate(`/teacher/evaluations/${id}`);
          }}
        />
      )}
    </section>
  );
}
