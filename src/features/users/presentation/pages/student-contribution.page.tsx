import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import { useStudentContribution } from '../hooks/use-students';
import { StudentStatusBadge } from '../components/student-status-badge';
import '../styles/students.css';
export default function StudentContributionPage() {
  const { studentId = '' } = useParams();
  const [params] = useSearchParams();
  const course = params.get('course') ?? '';
  const query = useStudentContribution(course, studentId);
  const backParams = new URLSearchParams({
    ...(course ? { course } : {}),
    ...(params.get('q') ? { q: params.get('q')! } : {}),
  });
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <section className="students-page">
        <Link className="student-back" to={`/teacher/students?${backParams}`}>
          Volver a estudiantes
        </Link>
        <ErrorState
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      </section>
    );
  const data = query.data;
  return (
    <section className="students-page">
      <Link className="student-back" to={`/teacher/students?${backParams}`}>
        <ArrowLeft size={15} />
        Volver a estudiantes
      </Link>
      <div className="students-page-heading">
        <div>
          <p className="eyebrow">CONTRIBUCIÓN DEL ESTUDIANTE</p>
          <h1>{data.student.name}</h1>
          <p>
            {data.student.email} · {data.course.name} — Sección{' '}
            {data.course.section}
          </p>
        </div>
        <StudentStatusBadge status={data.student.status} />
      </div>
      <p className="students-demo-label">
        Demostración · Actividad y evidencias simuladas. No se consultan
        repositorios reales.
      </p>
      <div className="student-contribution-meta">
        <article>
          <h2>Equipo y proyecto</h2>
          <strong>{data.student.team}</strong>
          <p>{data.student.projectName}</p>
          <Button asChild variant="outline" size="sm">
            <Link
              to={`/projects/${encodeURIComponent(data.student.projectId)}`}
            >
              Abrir proyecto
              <ExternalLink size={13} />
            </Link>
          </Button>
        </article>
        <article>
          <h2>Participación orientativa</h2>
          <strong>{data.student.participation}%</strong>
          <progress
            value={data.student.participation}
            max={100}
            aria-label="Participación orientativa"
          />
          <p>{data.period}</p>
        </article>
        <article>
          <h2>Actividad registrada</h2>
          <strong>{data.student.commits} commits</strong>
          <p>{data.reviewedChanges} cambios revisados en la muestra.</p>
          <p>Los conteos no constituyen una calificación.</p>
        </article>
      </div>
      <div className="student-evidence-card">
        <h2>Evidencias de contribución</h2>
        {data.evidence.length ? (
          <ul>
            {data.evidence.map((item) => (
              <li key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <time dateTime={item.recordedAt}>
                  {new Intl.DateTimeFormat('es-PE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'America/Lima',
                  }).format(new Date(item.recordedAt))}{' '}
                  · Lima
                </time>
                <small>Referencia de demostración: {item.id}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>Todavía no hay evidencias disponibles para este estudiante.</p>
        )}
      </div>
      <aside className="students-orientation">
        <ShieldCheck size={18} aria-hidden="true" />
        <div>
          <strong>Revisión y acompañamiento docente</strong>
          <p>{data.guidance}</p>
        </div>
      </aside>
    </section>
  );
}
