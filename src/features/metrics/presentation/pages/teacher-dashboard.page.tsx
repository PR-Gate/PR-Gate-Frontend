import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Download,
  Folder,
  GitBranch,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import { useAuth } from '@/shared/services/auth/auth-context';
import type { OverviewPeriod } from '../../domain/entities/teacher-overview.entity';
import { useTeacherOverview } from '../hooks/use-teacher-overview';
import { TeacherSummaryCards } from '../components/teacher-summary-cards';
import { TeacherProgressStrip } from '../components/teacher-progress-strip';
import { ProjectStatusChart } from '../components/project-status-chart';
import { RecentActivityList } from '../components/recent-activity-list';
import { ProjectsAttentionTable } from '../components/projects-attention-table';
import { downloadOverviewCsv } from '../utils/export-overview';
import { formatOverviewDate } from '../utils/overview-format';
import '../styles/teacher-dashboard.css';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState<OverviewPeriod>('30');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const studentsOpen = location.hash === '#students';
  const setStudentsOpen = (open: boolean) => {
    void navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: open ? '#students' : '',
      },
      { replace: true },
    );
  };
  const query = useTeacherOverview(course, period);
  const overview = query.data;
  useEffect(() => {
    if (location.hash === '#course-selector')
      document.getElementById('course-selector')?.focus();
  }, [location.hash, overview?.course.id]);
  const projects = (overview?.projects ?? []).filter((project) =>
    `${project.name} ${project.team}`
      .toLocaleLowerCase('es')
      .includes(search.trim().toLocaleLowerCase('es')),
  );
  const refresh = async () => {
    const result = await query.refetch();
    if (result.isSuccess) toast.success('Datos de demostración actualizados');
  };
  return (
    <section className="teacher-dashboard" aria-labelledby="teacher-heading">
      <div className="teacher-toolbar">
        <label className="teacher-course-control" htmlFor="course-selector">
          <span>CURSO ACTIVO</span>
          <select
            id="course-selector"
            value={course || overview?.course.id || ''}
            disabled={!overview || query.isFetching}
            onChange={(event) => {
              setCourse(event.target.value);
              setSearch('');
            }}
            aria-label="Curso activo"
          >
            {overview ? (
              overview.courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · Sección {item.section}
                </option>
              ))
            ) : (
              <option value="">Cargando cursos…</option>
            )}
          </select>
        </label>
        <div className="teacher-toolbar-actions">
          <span title="Disponible cuando se implemente la integración con GitHub">
            <Button variant="outline" size="sm" disabled>
              <GitBranch size={14} />
              Conectar GitHub
            </Button>
          </span>
          <Button
            variant="outline"
            size="sm"
            aria-pressed={preview}
            onClick={() => setPreview((value) => !value)}
          >
            {preview ? 'Volver a vista docente' : 'Vista estudiante'}
          </Button>
        </div>
      </div>
      <div className="teacher-page-heading">
        <div>
          <p className="eyebrow">
            {new Intl.DateTimeFormat('es-PE', {
              dateStyle: 'full',
              timeZone: 'America/Lima',
            }).format(new Date())}
          </p>
          <h1 id="teacher-heading">
            Buenos días, {user?.name.split(' ')[0] ?? 'docente'}
          </h1>
          <p>Esto es lo que requiere tu atención hoy.</p>
        </div>
        <div className="teacher-heading-actions">
          <Button
            variant="outline"
            disabled={!overview || query.isFetching || preview}
            onClick={() => {
              if (overview) {
                try {
                  downloadOverviewCsv(overview, projects, period);
                } catch {
                  toast.error(
                    'No se pudo descargar el reporte. Inténtalo nuevamente.',
                  );
                }
              }
            }}
          >
            <Download size={15} />
            Exportar reporte
          </Button>
          <Button asChild>
            <Link to="/projects">
              <Folder size={15} />
              Revisar proyectos
            </Link>
          </Button>
        </div>
      </div>
      <div className="teacher-filter-bar">
        <span className="teacher-demo-label">
          DEMOSTRACIÓN · Datos simulados
        </span>
        <label className="sr-only" htmlFor="overview-search">
          Buscar proyecto o equipo
        </label>
        <div className="teacher-search">
          <Search size={15} aria-hidden="true" />
          <input
            id="overview-search"
            placeholder="Buscar proyecto o equipo…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            disabled={!overview}
          />
        </div>
        <label className="teacher-period">
          Periodo
          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as OverviewPeriod)
            }
            disabled={query.isFetching}
          >
            <option value="30">Últimos 30 días</option>
            <option value="7">Últimos 7 días</option>
          </select>
        </label>
        <Button
          variant="outline"
          size="icon"
          aria-label="Actualizar resumen"
          disabled={query.isFetching}
          onClick={() => {
            void refresh();
          }}
        >
          <RefreshCw
            size={15}
            className={query.isFetching ? 'animate-spin' : ''}
          />
        </Button>
      </div>
      <p className="teacher-integration-note">
        GitHub y las actualizaciones en tiempo real estarán disponibles al
        integrar el backend.
      </p>
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
        overview && (
          <>
            <p className="teacher-data-timestamp">
              Datos de ejemplo al {formatOverviewDate(overview.generatedAt)} ·
              Zona horaria: Lima
            </p>
            {preview ? (
              <div className="teacher-preview">
                <p>
                  <strong>Vista previa de estudiante</strong> · Tus permisos
                  docentes no cambian. Esta vista es ilustrativa y no representa
                  a un estudiante específico.
                </p>
                <h2 className="mt-5 font-semibold">
                  Proyectos del curso en esta muestra
                </h2>
                {projects.length ? (
                  <ul>
                    {projects.map((project) => (
                      <li key={project.id}>
                        <Link to={`/projects/${project.id}`}>
                          {project.name} · {project.team}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    title="Sin proyectos en esta muestra"
                    description="Selecciona otro curso o cambia la búsqueda."
                  />
                )}
              </div>
            ) : (
              <>
                <TeacherSummaryCards overview={overview} />
                <TeacherProgressStrip overview={overview} />
                <div className="teacher-widget-grid">
                  <ProjectStatusChart overview={overview} />
                  <RecentActivityList
                    key={`${overview.course.id}-${period}`}
                    activities={overview.activities}
                  />
                </div>
                <ProjectsAttentionTable
                  projects={projects}
                  hasSearch={Boolean(search.trim())}
                />
                <div className="teacher-roster-access">
                  <Button
                    variant="outline"
                    onClick={() => setStudentsOpen(true)}
                  >
                    <Users size={16} />
                    Ver muestra de estudiantes
                  </Button>
                  <span>
                    Listado ilustrativo; los totales del curso se muestran en el
                    resumen.
                  </span>
                </div>
              </>
            )}
            <Dialog
              open={studentsOpen}
              onOpenChange={setStudentsOpen}
              title="Muestra de estudiantes"
              description={`${overview.course.name} · Listado parcial de demostración. No representa el padrón completo del curso.`}
            >
              {overview.students.length ? (
                <ul className="teacher-student-list">
                  {overview.students.map((student) => (
                    <li key={student.id}>
                      <div>
                        <strong>{student.name}</strong>
                        <p>{student.team}</p>
                      </div>
                      <span
                        className={`teacher-status ${student.active ? 'teacher-tone-green' : 'teacher-tone-amber'}`}
                      >
                        {student.active ? 'Activo' : 'Sin actividad'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay estudiantes en esta muestra.</p>
              )}
            </Dialog>
          </>
        )
      )}
    </section>
  );
}
