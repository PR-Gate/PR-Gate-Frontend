import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useRepositoryProjects } from '../hooks/use-repository-projects';
import '../styles/teacher-courses.css';

export function TeacherCoursesPage() {
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const { courses, createCourse } = useRepositoryProjects(false, 0, '');
  const items = courses.data?.pages.flatMap((page) => page.items) ?? [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get('name')).trim();
    const section = String(fields.get('section')).trim();
    const academicPeriod = String(fields.get('academicPeriod')).trim();
    if (!name || !section || !academicPeriod) {
      setNotice('Completa los tres campos del curso.');
      return;
    }
    setNotice('');
    createCourse.mutate(
      { name, section, academicPeriod },
      {
        onSuccess: () => {
          setCreating(false);
          setNotice('Curso creado.');
        },
      },
    );
  }

  return (
    <section
      className="teacher-courses"
      aria-labelledby="teacher-courses-heading"
    >
      <header className="teacher-courses-heading">
        <div>
          <p className="eyebrow">DOCENCIA</p>
          <h1 className="page-title" id="teacher-courses-heading">
            Mis cursos
          </h1>
          <p>Consulta y crea los cursos que tienes a cargo.</p>
        </div>
        {!creating && (
          <Button
            onClick={() => {
              createCourse.reset();
              setNotice('');
              setCreating(true);
            }}
          >
            Crear curso
          </Button>
        )}
      </header>
      {notice && <p role="status">{notice}</p>}
      {creating && (
        <form
          onSubmit={submit}
          className="teacher-courses-panel grid gap-4 p-6"
        >
          <h2 className="font-semibold">Nuevo curso</h2>
          <fieldset
            disabled={createCourse.isPending}
            className="grid gap-4 sm:grid-cols-3"
          >
            <label className="grid gap-2">
              Nombre
              <input
                name="name"
                required
                maxLength={150}
                className="rounded border p-2"
              />
            </label>
            <label className="grid gap-2">
              Sección
              <input
                name="section"
                required
                maxLength={50}
                className="rounded border p-2"
              />
            </label>
            <label className="grid gap-2">
              Periodo académico
              <input
                name="academicPeriod"
                required
                maxLength={30}
                placeholder="2026-2"
                className="rounded border p-2"
              />
            </label>
          </fieldset>
          {createCourse.isError && (
            <p role="alert">
              No se pudo crear el curso. Revisa los datos e inténtalo
              nuevamente.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={createCourse.isPending}>
              {createCourse.isPending ? 'Guardando…' : 'Guardar curso'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={createCourse.isPending}
              onClick={() => {
                setCreating(false);
                setNotice('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
      <section
        className="teacher-courses-panel p-6"
        aria-labelledby="teacher-course-list-heading"
      >
        <h2 className="font-semibold" id="teacher-course-list-heading">
          Tus cursos
        </h2>
        {courses.isPending && <p role="status">Cargando cursos…</p>}
        {courses.isError && (
          <div role="alert" className="mt-4 flex flex-wrap items-center gap-3">
            <p>No se pudieron cargar los cursos.</p>
            <Button variant="outline" onClick={() => void courses.refetch()}>
              Reintentar
            </Button>
          </div>
        )}
        {courses.isSuccess && items.length === 0 && (
          <p className="mt-4">
            Aún no tienes cursos. Crea el primero para empezar.
          </p>
        )}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((course) => (
            <li key={course.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">{course.name}</h3>
              <p className="text-sm text-muted-foreground">
                Sección {course.section} · Periodo {course.academicPeriod}
              </p>
            </li>
          ))}
        </ul>
        {courses.hasNextPage && (
          <Button
            className="mt-4"
            variant="outline"
            disabled={courses.isFetchingNextPage}
            onClick={() => void courses.fetchNextPage()}
          >
            Cargar más cursos
          </Button>
        )}
      </section>
    </section>
  );
}
