import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { FolderKanban } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState, ErrorState } from '@/shared/components/feedback/async-state';
import { useAuth } from '@/shared/services/auth/auth-context';
import { useEvaluationApi } from '@/features/metrics/presentation/hooks/use-evaluation';

export function TeacherProjectsPage() {
  const api = useEvaluationApi();
  const { user } = useAuth();
  const [courseId, setCourseId] = useState('');
  const courses = useInfiniteQuery({
    queryKey: ['live-evaluation', user?.id, 'courses'],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => api.courses(pageParam, signal),
    getNextPageParam: (page) => page.hasNext ? page.page + 1 : undefined,
  });
  const projects = useInfiniteQuery({
    queryKey: ['live-evaluation', user?.id, 'projects', courseId],
    enabled: Boolean(courseId),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => api.projects(courseId, pageParam, signal),
    getNextPageParam: (page) => page.hasNext ? page.page + 1 : undefined,
  });
  const items = projects.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">Proyectos del curso</h1>
        <Button asChild variant="outline"><Link to="/projects">Gestionar solicitudes de acceso</Link></Button>
      </header>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-5">
        <label className="grid gap-2 text-sm font-medium">
          Curso
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2">
            <option value="">Selecciona un curso</option>
            {courses.data?.pages.flatMap((page) => page.items).map((course) => (
              <option key={course.id} value={course.id}>{course.name} · {course.section} · {course.academicPeriod}</option>
            ))}
          </select>
        </label>
        {courses.hasNextPage && <Button variant="outline" disabled={courses.isFetchingNextPage} onClick={() => void courses.fetchNextPage()}>Más cursos</Button>}
      </div>
      {courses.isPending && <p role="status">Cargando cursos…</p>}
      {courses.isError && <ErrorState error={courses.error} retry={() => void courses.refetch()} />}
      {courseId && projects.isPending && <p role="status">Cargando proyectos…</p>}
      {projects.isError && <ErrorState error={projects.error} retry={() => void projects.refetch()} />}
      {projects.isSuccess && !items.length && <EmptyState title="Aún no hay proyectos en este curso" description="Los proyectos aparecerán al registrarse en el curso." />}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary">
            <FolderKanban size={20} className="shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="break-words font-semibold">{project.name}</h2>
              <Badge>{project.organizationLogin ?? 'Organización por vincular'}</Badge>
            </div>
          </Link>
        ))}
      </div>
      {projects.hasNextPage && <Button variant="outline" disabled={projects.isFetchingNextPage} onClick={() => void projects.fetchNextPage()}>Más proyectos</Button>}
    </section>
  );
}
