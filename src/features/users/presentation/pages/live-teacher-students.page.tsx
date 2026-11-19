import { useState } from 'react';
import { Users } from 'lucide-react';
import { useRepositoryProjects } from '@/features/projects/presentation/hooks/use-repository-projects';
import { EmptyState, ErrorState } from '@/shared/components/feedback/async-state';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

const status = { APPROVED: 'Matriculado', PENDING: 'Pendiente', REJECTED: 'Rechazado' } as const;

export function LiveTeacherStudentsPage() {
  const [courseId, setCourseId] = useState('');
  const [page, setPage] = useState(0);
  const { courses, pending: enrollments } = useRepositoryProjects(false, page, courseId);
  return (
    <section className="space-y-6">
      <header><h1 className="page-title">Estudiantes</h1></header>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-5">
        <label className="grid gap-2 text-sm font-medium">
          Curso
          <select className="rounded-lg border border-border bg-background px-3 py-2" value={courseId}
            onChange={(event) => { setCourseId(event.target.value); setPage(0); }}>
            <option value="">Selecciona un curso</option>
            {courses.data?.pages.flatMap((result) => result.items).map((course) => (
              <option key={course.id} value={course.id}>{course.name} · {course.section} · {course.academicPeriod}</option>
            ))}
          </select>
        </label>
        {courses.hasNextPage && <Button variant="outline" disabled={courses.isFetchingNextPage} onClick={() => void courses.fetchNextPage()}>Más cursos</Button>}
      </div>
      {(courses.isPending || (courseId && enrollments.isPending)) && <p role="status">Cargando información del curso…</p>}
      {courses.isError && <ErrorState error={courses.error} retry={() => void courses.refetch()} />}
      {enrollments.isError && <ErrorState error={enrollments.error} retry={() => void enrollments.refetch()} />}
      {courseId && enrollments.isSuccess && (
        enrollments.data.items.length ? (
          <section className="rounded-xl border border-border bg-card" aria-labelledby="roster-heading">
            <h2 id="roster-heading" className="flex items-center gap-2 p-5 font-semibold"><Users className="text-primary" size={18} />Estudiantes y solicitudes</h2>
            <ul className="divide-y divide-border border-t border-border">
              {enrollments.data.items.map((enrollment) => (
                <li key={enrollment.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span>{enrollment.studentName?.trim() || 'Nombre no disponible'}</span>
                  <Badge>{status[enrollment.status]}</Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : <EmptyState title="Aún no hay solicitudes" description="Las solicitudes de acceso al curso aparecerán aquí." />
      )}
      {(page > 0 || enrollments.data?.hasNext) && (
        <div className="flex gap-3">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
          <Button variant="outline" disabled={!enrollments.data?.hasNext} onClick={() => setPage(page + 1)}>Siguiente</Button>
        </div>
      )}
    </section>
  );
}
