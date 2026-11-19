import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { ClipboardCheck, GitBranch } from 'lucide-react';
import { useActiveProject } from '@/features/projects/presentation/hooks/use-active-project';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { useAuth } from '@/shared/services/auth/auth-context';
import type {
  AcademicProject,
  EvaluationRepository,
  PublishedRubric,
} from '../../domain/evaluation';
import { useEvaluationApi } from '../hooks/use-evaluation';
import {
  EvaluationEmpty,
  EvaluationError,
} from '../components/evaluation-feedback';
import { CourseRubricLibrary } from '../components/course-rubric-library';
import { LiveRubricEditor } from '../components/live-rubric-editor';
import { RepositoryEvaluationPanel } from '../components/repository-evaluation-panel';
import '../styles/evaluation-workspace.css';

export function EvaluationWorkspacePage() {
  const { user } = useAuth();
  if (user?.roles.includes('STUDENT') && !user.roles.includes('TEACHER')) {
    return <StudentEvaluationWorkspace />;
  }
  return <CourseEvaluationWorkspace />;
}

function StudentEvaluationWorkspace() {
  const { active, projects, catalog } = useActiveProject();
  const { projectId } = useParams();
  const [search] = useSearchParams();
  const requestedId = projectId ?? search.get('projectId');
  const selected = requestedId ? projects.find((item) => item.id === requestedId) : active;
  return (
    <section className="evaluation-workspace evaluation-student" aria-labelledby="evaluation-heading">
      <header className="evaluation-student-header">
        <div className="evaluation-heading-row">
          <div className="evaluation-heading-title">
            <span className="evaluation-heading-icon"><ClipboardCheck size={23} aria-hidden="true" /></span>
            <div>
              <h1 className="page-title" id="evaluation-heading">Mi rúbrica y resultados</h1>
              {selected && <p className="evaluation-subtitle">{selected.name}</p>}
            </div>
          </div>
        </div>
      </header>
      {catalog.isPending && <p role="status">Cargando tus proyectos…</p>}
      {catalog.isError && <EvaluationError retry={() => void catalog.refetch()} />}
      {catalog.isSuccess && !selected && (
        <EvaluationEmpty>Selecciona un proyecto en la barra lateral para consultar la evaluación.</EvaluationEmpty>
      )}
      {selected && (
        <>
          <CourseRubricLibrary key={selected.courseId} courseId={selected.courseId} teacher={false} />
          <ProjectEvaluationWorkspace key={selected.id} project={selected} teacher={false} />
        </>
      )}
    </section>
  );
}

function CourseEvaluationWorkspace() {
  const api = useEvaluationApi();
  const { user } = useAuth();
  const teacher = Boolean(user?.roles.includes('TEACHER'));
  const { projectId: routeProjectId } = useParams();
  const [search] = useSearchParams();
  const [courseId, setCourseId] = useState(search.get('courseId') ?? '');
  const [projectId, setProjectId] = useState(routeProjectId ?? '');
  const courses = useInfiniteQuery({
    queryKey: ['live-evaluation', user?.id, 'courses'],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => api.courses(pageParam, signal),
    getNextPageParam: (page) => (page.hasNext ? page.page + 1 : undefined),
  });
  const projects = useInfiniteQuery({
    queryKey: ['live-evaluation', user?.id, 'projects', courseId],
    enabled: Boolean(courseId),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api.projects(courseId, pageParam, signal),
    getNextPageParam: (page) => (page.hasNext ? page.page + 1 : undefined),
  });
  const selected = projects.data?.pages
    .flatMap((p) => p.items)
    .find((p) => p.id === projectId);
  return (
    <section
      className="evaluation-workspace"
      aria-labelledby="evaluation-heading"
    >
      <header>
        <p className="eyebrow">EVALUACIÓN DEL PROYECTO</p>
        <h1 className="page-title" id="evaluation-heading">
          {teacher ? 'Rúbricas y evaluación' : 'Mi rúbrica y resultados'}
        </h1>
        <p className="evaluation-subtitle">
          Rúbricas de 20 puntos, evidencia por repositorio y estimaciones de IA
          identificadas como orientativas.
        </p>
      </header>
      <div className="evaluation-card evaluation-selection">
        <label>
          Curso
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setProjectId('');
            }}
          >
            <option value="">Selecciona un curso</option>
            {courses.data?.pages
              .flatMap((p) => p.items)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.section} · {c.academicPeriod}
                </option>
              ))}
          </select>
        </label>
        <label>
          Proyecto académico
          <select
            value={projectId}
            disabled={!courseId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Selecciona un proyecto</option>
            {projects.data?.pages
              .flatMap((p) => p.items)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </label>
        {courses.hasNextPage && (
          <Button
            variant="outline"
            disabled={courses.isFetchingNextPage}
            onClick={() => void courses.fetchNextPage()}
          >
            Cargar más cursos
          </Button>
        )}
        {projects.hasNextPage && (
          <Button
            variant="outline"
            disabled={projects.isFetchingNextPage}
            onClick={() => void projects.fetchNextPage()}
          >
            Cargar más proyectos
          </Button>
        )}
      </div>
      {(courses.isPending || (courseId && projects.isPending)) && (
        <p role="status">Cargando tu información académica…</p>
      )}
      {courses.isError && (
        <EvaluationError retry={() => void courses.refetch()} />
      )}
      {courseId && projects.isError && (
        <EvaluationError retry={() => void projects.refetch()} />
      )}
      {courses.isSuccess && !courses.data.pages.some((p) => p.items.length) && (
        <EvaluationEmpty>
          No tienes cursos disponibles. Tus cursos deben estar registrados antes
          de configurar una rúbrica.
        </EvaluationEmpty>
      )}
      {courseId &&
        projects.isSuccess &&
        !projects.data.pages.some((p) => p.items.length) && (
          <EvaluationEmpty>
            No hay proyectos disponibles para tu cuenta en este curso.
          </EvaluationEmpty>
        )}
      {courseId && (
        <CourseRubricLibrary
          key={courseId}
          courseId={courseId}
          teacher={teacher}
        />
      )}
      {selected ? (
        <ProjectEvaluationWorkspace
          key={selected.id}
          project={selected}
          teacher={teacher}
        />
      ) : (
        <EvaluationEmpty>
          Selecciona tu curso y proyecto para consultar la evaluación.
        </EvaluationEmpty>
      )}
    </section>
  );
}

function ProjectEvaluationWorkspace({
  project,
  teacher,
}: {
  project: AcademicProject;
  teacher: boolean;
}) {
  const api = useEvaluationApi();
  const { user } = useAuth();
  const client = useQueryClient();
  const [repositoryKey, setRepositoryKey] = useState('');
  const [editor, setEditor] = useState<{
    rubric?: PublishedRubric;
    configureOnly?: boolean;
  } | null>(null);
  const repositories = useQuery({
    queryKey: ['live-evaluation', user?.id, project.id, 'repositories'],
    queryFn: ({ signal }) => api.repositories(project.id, signal),
  });
  const rubrics = useInfiniteQuery({
    queryKey: ['live-evaluation', user?.id, 'course-rubrics', project.courseId],
    enabled: teacher,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api.rubrics(project.courseId, pageParam, signal),
    getNextPageParam: (last, _, n) => (last.length === 100 ? n + 1 : undefined),
  });
  const repository = repositories.data?.find(
    (r) => `${r.id}:${r.gitRef}` === repositoryKey,
  );
  const refresh = () =>
    client.invalidateQueries({
      queryKey: ['live-evaluation', user?.id, project.id],
    });
  return (
    <>
      <section className="evaluation-card">
        <div className="evaluation-heading-row">
          <div>
            <h2 className="evaluation-heading-title"><GitBranch size={18} className="text-primary" aria-hidden="true" />{teacher ? project.name : 'Repositorio del proyecto'}</h2>
            <p className="evaluation-subtitle">
              {project.organizationLogin
                ? `Organización: ${project.organizationLogin}`
                : 'Este proyecto aún no tiene una organización vinculada.'}
            </p>
          </div>
        </div>
        <label>
          Repositorio y rama
          <select
            value={repositoryKey}
            onChange={(e) => setRepositoryKey(e.target.value)}
          >
            <option value="">Selecciona un repositorio</option>
            {repositories.data?.map((r) => (
              <option key={`${r.id}:${r.gitRef}`} value={`${r.id}:${r.gitRef}`}>
                {r.fullName} · {r.gitRef.replace('refs/heads/', '')}
              </option>
            ))}
          </select>
        </label>
        {repositories.isError && (
          <EvaluationError retry={() => void repositories.refetch()} />
        )}
        {repositories.isPending && (
          <p role="status">Consultando repositorios analizados…</p>
        )}
        {repositories.isSuccess && repositories.data.length === 0 && (
          <EvaluationEmpty>
            {project.organizationLogin
              ? 'Todavía no hay análisis recibidos para los repositorios de esta organización. Realiza primero un push válido con la integración de GitHub configurada.'
              : 'Vincula la organización del grupo a este proyecto antes de configurar su evaluación.'}
          </EvaluationEmpty>
        )}
      </section>
      {teacher && <section className="evaluation-card">
        <h2>Rúbricas disponibles para el Quality Gate</h2>
        {rubrics.isError && (
          <EvaluationError retry={() => void rubrics.refetch()} />
        )}
        {rubrics.isPending && <p role="status">Cargando rúbricas…</p>}
        {rubrics.isSuccess && !rubrics.data.pages.some((p) => p.length) && (
          <EvaluationEmpty>
            Aún no hay rúbricas publicadas para este curso.
          </EvaluationEmpty>
        )}
        <div className="evaluation-rubric-grid">
          {rubrics.data?.pages.flat().map((r) => (
            <article key={`${r.id}:${r.version}`} className="evaluation-rubric">
              <h3>{r.title}</h3>
              <p>
                Versión {r.version} · {r.maxPoints} puntos
              </p>
              <ul>
                {r.criteria.map((c) => (
                  <li key={c.id}>
                    {c.description} <strong>{c.maxPoints} pts</strong>
                  </li>
                ))}
              </ul>
              {teacher && (
                <div className="evaluation-actions">
                  <Button
                    variant="outline"
                    disabled={!repository}
                    onClick={() =>
                      setEditor({ rubric: r, configureOnly: true })
                    }
                  >
                    Configurar condiciones
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
        {rubrics.hasNextPage && (
          <Button
            variant="outline"
            onClick={() => void rubrics.fetchNextPage()}
          >
            Cargar más rúbricas
          </Button>
        )}
      </section>}
      {repository && (
        <RepositoryEvaluationPanel
          key={`${project.id}:${repositoryKey}`}
          projectId={project.id}
          repository={repository}
          teacher={teacher}
        />
      )}
      {editor && repository && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setEditor(null);
          }}
          title={
            editor.configureOnly
              ? 'Configurar condiciones'
              : editor.rubric
                ? 'Publicar nueva versión'
                : 'Crear rúbrica de 20 puntos'
          }
          description="Define los criterios y aprueba las condiciones técnicas que se aplicarán al repositorio."
          contentClassName="max-w-3xl"
        >
          <LiveRubricEditor
            projectId={project.id}
            repository={repository as EvaluationRepository}
            rubric={editor.rubric}
            configureOnly={editor.configureOnly}
            onSaved={() => {
              setEditor(null);
              void refresh();
            }}
          />
        </Dialog>
      )}
    </>
  );
}
