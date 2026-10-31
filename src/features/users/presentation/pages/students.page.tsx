import { useSearchParams } from 'react-router';
import { Download, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import { useStudents } from '../hooks/use-students';
import { StudentCourseSelector } from '../components/student-course-selector';
import { StudentsTable } from '../components/students-table';
import { downloadStudentsCsv } from '../utils/export-students';
import '../styles/students.css';
export default function StudentsPage() {
  const [params, setParams] = useSearchParams();
  const courseId = params.get('course') ?? '';
  const search = params.get('q') ?? '';
  const query = useStudents(courseId);
  const roster = query.data;
  const filtered = (roster?.students ?? []).filter((student) =>
    `${student.name} ${student.email} ${student.team} ${student.projectName}`
      .toLocaleLowerCase('es')
      .includes(search.trim().toLocaleLowerCase('es')),
  );
  const refresh = async () => {
    const result = await query.refetch();
    if (result.isSuccess) toast.success('Datos de demostración actualizados.');
  };
  return (
    <section className="students-page">
      <div className="students-page-heading">
        <div>
          <p className="eyebrow">SEGUIMIENTO DEL CURSO</p>
          <h1>Estudiantes</h1>
          <p>
            Selecciona un curso y luego un estudiante para revisar su
            contribución.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={
            !roster || query.isFetching || !filtered.length || query.isError
          }
          onClick={() => {
            if (roster) {
              try {
                downloadStudentsCsv(roster.course, filtered);
              } catch {
                toast.error(
                  'No se pudo exportar la lista. Inténtalo nuevamente.',
                );
              }
            }
          }}
        >
          <Download size={15} />
          Exportar lista
        </Button>
      </div>
      <div className="students-demo-bar">
        <span>DEMOSTRACIÓN · Datos simulados</span>
        <Button
          size="sm"
          variant="ghost"
          disabled={query.isFetching}
          onClick={() => {
            void refresh();
          }}
        >
          <RefreshCw
            size={13}
            className={query.isFetching ? 'animate-spin' : ''}
          />
          Actualizar
        </Button>
      </div>
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
        roster && (
          <>
            <StudentCourseSelector
              courses={roster.courses}
              selected={roster.course}
              busy={query.isFetching}
              onChange={(id) => setParams({ course: id })}
            />
            <div className="students-summary-bar">
              <dl>
                {[
                  [roster.total, 'Estudiantes en este curso'],
                  [roster.regularActivity, 'Actividad regular'],
                  [roster.needsReview, 'Requieren revisión'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <label className="students-search">
                <Search size={15} aria-hidden="true" />
                <span className="sr-only">Buscar estudiante</span>
                <input
                  placeholder="Buscar estudiante, equipo o proyecto…"
                  value={search}
                  onChange={(event) =>
                    setParams(
                      {
                        ...(courseId ? { course: courseId } : {}),
                        ...(event.target.value
                          ? { q: event.target.value }
                          : {}),
                      },
                      { replace: true },
                    )
                  }
                />
              </label>
            </div>
            <div className="students-list-card">
              <div className="students-list-heading">
                <div>
                  <h2>Lista de estudiantes</h2>
                  <p>
                    Haz clic en un estudiante para consultar su actividad y
                    evidencia.
                  </p>
                </div>
                <span>{roster.course.name}</span>
              </div>
              {filtered.length ? (
                <StudentsTable
                  students={filtered}
                  courseId={roster.course.id}
                  search={search}
                />
              ) : (
                <EmptyState
                  title={
                    search.trim()
                      ? 'No hay coincidencias'
                      : 'Aún no hay estudiantes en este curso'
                  }
                  description={
                    search.trim()
                      ? 'Prueba otro nombre, equipo o proyecto.'
                      : 'La lista aparecerá cuando se registren estudiantes en el servicio.'
                  }
                />
              )}
            </div>
            <p className="students-list-count" aria-live="polite">
              Mostrando {filtered.length} de {roster.total} estudiantes · Datos
              de ejemplo al{' '}
              {new Intl.DateTimeFormat('es-PE', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'America/Lima',
              }).format(new Date(roster.updatedAt))}{' '}
              (Lima)
            </p>
          </>
        )
      )}
      <aside className="students-orientation">
        <ShieldCheck size={18} aria-hidden="true" />
        <div>
          <strong>La participación es una señal orientativa</strong>
          <p>
            Los datos técnicos ayudan a identificar estudiantes que podrían
            necesitar acompañamiento. Revisa siempre la evidencia antes de tomar
            una decisión académica.
          </p>
        </div>
      </aside>
    </section>
  );
}
