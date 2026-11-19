import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, FolderKanban, GitBranch, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { HttpError } from '@/shared/services/http/http-error';
import { useRepositoryProjects } from '../hooks/use-repository-projects';

export default function RepositoryProjectsPage() {
  const [projectToLink, setProjectToLink] = useState<string>();
  const [page, setPage] = useState(0);
  const [course, setCourse] = useState('');
  const [organization, setOrganization] = useState('');
  const [notice, setNotice] = useState('');
  const query = useRepositoryProjects(Boolean(projectToLink), page, course);
  const organizations =
    query.organizations.data?.pages.flatMap((p) => p.items) ?? [];
  const courses = query.courses.data?.pages.flatMap((p) => p.items) ?? [];
  const catalog = query.catalog.data?.pages.flatMap((p) => p.items) ?? [];
  const admissions = query.admissions.data?.pages.flatMap((p) => p.items) ?? [];
  const field =
    'mt-2 w-full rounded-lg border border-border bg-white p-3 text-sm focus:outline-primary';
  function moreCourses() {
    return (
      query.courses.hasNextPage && (
        <Button
          type="button"
          variant="outline"
          disabled={query.courses.isFetchingNextPage}
          onClick={() => void query.courses.fetchNextPage()}
        >
          Cargar más cursos
        </Button>
      )
    );
  }
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">TU ESPACIO ACADÉMICO</p>
          <h1 className="page-title">Proyectos</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {query.student
              ? 'Entra a un curso para crear tu proyecto y vincular su organización de GitHub.'
              : 'Crea tus cursos y revisa las solicitudes de estudiantes.'}
          </p>
        </div>
      </div>
      {notice && (
        <p
          role="status"
          className="my-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}
      {query.courses.isPending && (
        <p role="status" className="my-6">
          Consultando cursos…
        </p>
      )}
      {query.courses.isError && (
        <div
          role="alert"
          className="my-6 rounded-lg border border-red-200 p-4 text-sm text-red-700"
        >
          No se pudieron cargar los cursos. Comprueba que Projects esté
          disponible y configurado en el puerto 8083.{' '}
          <Button
            variant="outline"
            onClick={() => void query.courses.refetch()}
          >
            Reintentar
          </Button>
        </div>
      )}
      {query.student ? (
        <>
          <div className="mt-8 rounded-xl border border-border bg-card p-5 shadow-sm">
          <label className="block text-sm font-semibold">
            <span className="flex items-center gap-2"><BookOpen size={17} className="text-primary" aria-hidden="true" />Mis cursos</span>
            <select className={field} value={course} disabled={query.createProject.isPending} onChange={(event) => {
              setCourse(event.target.value);
              setPage(0);
              query.createProject.reset();
            }}>
              <option value="">Selecciona un curso</option>
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.section} · {item.academicPeriod}
                </option>
              ))}
            </select>
          </label>
          {moreCourses()}
          </div>
          {query.courses.isSuccess && !courses.length && (
            <p className="my-4 text-sm">Aquí aparecerán los cursos en los que tienes acceso aprobado.</p>
          )}
          {course && (
            <section key={course} className="mt-6 space-y-4">
              <form className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  const name = String(data.get('name')).trim();
                  if (!name) return;
                  query.createProject.mutate({ name, description: String(data.get('description')).trim() }, {
                    onSuccess: (project) => {
                      form.reset();
                      setPage(0);
                      setNotice('Proyecto creado. Puedes vincular la organización ahora o desde el listado.');
                      setOrganization('');
                      query.linkOrganization.reset();
                      setProjectToLink(project.id);
                    },
                  });
                }}>
                <h2 className="flex items-center gap-2 text-lg font-semibold"><Plus size={19} className="text-primary" aria-hidden="true" />Crear proyecto</h2>
                <fieldset disabled={query.createProject.isPending} className="space-y-3">
                  <label className="block text-sm">
                    Nombre del proyecto
                    <input name="name" required maxLength={150} className={field} />
                  </label>
                  <label className="block text-sm">
                    Descripción (opcional)
                    <textarea name="description" maxLength={2000} className={field} />
                  </label>
                  <Button type="submit"><Plus size={16} />Crear proyecto</Button>
                </fieldset>
                {query.createProject.isError && (
                  <p role="alert" className="text-sm text-red-700">
                    {query.createProject.error instanceof HttpError && query.createProject.error.status === 409
                      ? 'Ya perteneces a un proyecto en este curso.'
                      : 'No se pudo crear el proyecto. Comprueba que tienes acceso aprobado al curso.'}
                  </p>
                )}
              </form>
              <h2 className="text-lg font-semibold">Proyectos del curso</h2>
              {query.projects.isPending && <p role="status">Consultando proyectos…</p>}
              {query.projects.isError && (
                <p role="alert">No se pudieron consultar los proyectos.{' '}
                  <Button variant="outline" onClick={() => void query.projects.refetch()}>Reintentar</Button>
                </p>
              )}
              {query.projects.isSuccess && !query.projects.data.items.length && <p>Aún no hay proyectos en este curso.</p>}
              {query.projects.data?.items.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><FolderKanban size={19} aria-hidden="true" /></span>
                    <div className="min-w-0 space-y-1">
                      <h3 className="break-words font-semibold"><Link className="hover:text-primary hover:underline" to={`/projects/${item.id}`}>{item.name}</Link></h3>
                      {item.description && <p className="break-words text-sm text-muted-foreground">{item.description}</p>}
                      <Badge>{item.organizationLogin ?? 'Organización por vincular'}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/pipelines?projectId=${encodeURIComponent(item.id)}`}><GitBranch size={16} />Ejecuciones CI/CD</Link>
                  </Button>
                  {item.leaderId === query.userId && !item.organizationLogin && (
                    <Button variant="outline" onClick={() => {
                      setOrganization('');
                      query.linkOrganization.reset();
                      setProjectToLink(item.id);
                    }}>Vincular organización</Button>
                  )}
                  </div>
                </article>
              ))}
              {(page > 0 || query.projects.data?.hasNext) && (
                <div className="flex gap-3">
                  <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
                  <Button variant="outline" disabled={!query.projects.data?.hasNext} onClick={() => setPage(page + 1)}>Siguiente</Button>
                </div>
              )}
            </section>
          )}
          <details className="mt-8 rounded-xl border border-border bg-white p-6">
            <summary className="cursor-pointer font-semibold">
              ¿No aparece tu curso? Solicitar acceso
            </summary>
            <p className="my-4 text-sm text-muted-foreground">
              Podrás entrar al curso cuando el docente apruebe tu
              solicitud.
            </p>
            {query.catalog.isError && (
              <p role="alert">No se pudo consultar el catálogo de cursos.</p>
            )}
            {query.admissions.isError && (
              <p role="alert">
                No se pudo consultar el estado de tus solicitudes.{' '}
                <Button
                  variant="outline"
                  onClick={() => void query.admissions.refetch()}
                >
                  Reintentar
                </Button>
              </p>
            )}
            {query.catalog.isSuccess && !catalog.length && (
              <p className="text-sm">
                Todavía no hay cursos creados por docentes.
              </p>
            )}
            {catalog.map((item) => {
              const status = admissions.find(
                (a) => a.courseId === item.id && a.status !== 'REJECTED',
              )?.status;
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4"
                >
                  <span className="text-sm">
                    {item.name} · {item.section} · {item.academicPeriod}
                  </span>
                  <Button
                    variant="outline"
                    disabled={
                      Boolean(status) ||
                      query.enroll.isPending ||
                      !query.admissions.isSuccess ||
                      query.admissions.hasNextPage
                    }
                    onClick={() => query.enroll.mutate(item.id)}
                  >
                    {status === 'APPROVED'
                      ? 'Acceso aprobado'
                      : status === 'PENDING'
                        ? 'Pendiente de aprobación'
                        : 'Solicitar acceso'}
                  </Button>
                </div>
              );
            })}
            {query.admissions.hasNextPage && (
              <Button
                variant="outline"
                onClick={() => void query.admissions.fetchNextPage()}
              >
                Cargar más solicitudes
              </Button>
            )}
            {query.catalog.hasNextPage && (
              <Button
                variant="outline"
                onClick={() => void query.catalog.fetchNextPage()}
              >
                Cargar más cursos
              </Button>
            )}
            {query.enroll.isError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                No se pudo registrar la solicitud. Revisa si ya tienes una
                pendiente e intenta actualizar.
              </p>
            )}
          </details>
        </>
      ) : (
        <>
          <form
            aria-label="Crear curso"
            className="my-7 space-y-4 rounded-xl border border-border bg-white p-6"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const data = new FormData(form);
              query.createCourse.mutate(
                {
                  name: String(data.get('name')),
                  section: String(data.get('section')),
                  academicPeriod: String(data.get('academicPeriod')),
                },
                {
                  onSuccess: () => {
                    form.reset();
                    setNotice(
                      'Curso creado. Los estudiantes ya pueden solicitar acceso.',
                    );
                  },
                },
              );
            }}
          >
            <h2 className="text-lg font-semibold">Crear curso</h2>
            <fieldset
              disabled={query.createCourse.isPending}
              className="grid gap-4 sm:grid-cols-3"
            >
              <label className="text-sm">
                Nombre
                <input name="name" required maxLength={150} className={field} />
              </label>
              <label className="text-sm">
                Sección
                <input
                  name="section"
                  required
                  maxLength={50}
                  className={field}
                />
              </label>
              <label className="text-sm">
                Periodo académico
                <input
                  name="academicPeriod"
                  required
                  maxLength={30}
                  placeholder="2026-2"
                  className={field}
                />
              </label>
            </fieldset>
            <Button type="submit" disabled={query.createCourse.isPending}>
              <Plus size={16} />
              Crear curso
            </Button>
            {query.createCourse.isError && (
              <p role="alert" className="text-sm text-red-700">
                No se pudo crear el curso. Revisa tu conexión y permisos de
                docente.
              </p>
            )}
          </form>
          <label className="block text-sm font-semibold">
            Solicitudes del curso
            <select
              className={field}
              value={course}
              onChange={(event) => {
                setCourse(event.target.value);
                setPage(0);
              }}
            >
              <option value="">Selecciona un curso</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.section} · {c.academicPeriod}
                </option>
              ))}
            </select>
          </label>
          {moreCourses()}
          {query.pending.isPending && course && (
            <p role="status" className="my-4">
              Consultando solicitudes…
            </p>
          )}
          {query.pending.isError && (
            <p role="alert" className="my-4 text-red-700">
              No se pudieron consultar las solicitudes.
            </p>
          )}
          {query.pending.data?.items.map((item) => (
            <article
              key={item.id}
              className="my-4 rounded-xl border border-border bg-white p-5"
            >
              <p className="break-words text-sm">Estudiante: {item.studentName?.trim() || 'Nombre no disponible'}</p>
              <p className="my-2 text-sm">
                {item.status === 'PENDING'
                  ? 'Solicitud pendiente'
                  : item.status === 'APPROVED'
                    ? 'Solicitud aprobada'
                    : 'Solicitud rechazada'}
              </p>
              {item.status === 'PENDING' && (
                <div className="flex gap-3">
                  <Button
                    disabled={query.decide.isPending}
                    onClick={() =>
                      query.decide.mutate({ id: item.id, decision: 'APPROVE' })
                    }
                  >
                    Aprobar acceso
                  </Button>
                  <Button
                    variant="outline"
                    disabled={query.decide.isPending}
                    onClick={() =>
                      query.decide.mutate({ id: item.id, decision: 'REJECT' })
                    }
                  >
                    Rechazar
                  </Button>
                </div>
              )}
            </article>
          ))}
          {course && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={!page}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={!query.pending.data?.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
          {query.decide.isError && (
            <p role="alert" className="mt-4 text-red-700">
              No se pudo resolver la solicitud. Verifica el token interno entre
              Projects y Users y los permisos del curso.
            </p>
          )}
        </>
      )}
      {projectToLink && (
        <Dialog
          open
          onOpenChange={(open) => { if (!open && !query.linkOrganization.isPending) setProjectToLink(undefined); }}
          title="Vincular organización de GitHub"
          description="Elige la organización que contiene los repositorios del proyecto."
        >
          {query.organizations.isPending && <p role="status">Consultando GitHub…</p>}
          {query.organizations.isError && (
            <p role="alert">
              {query.organizations.error instanceof HttpError &&
              query.organizations.error.code === 'GITHUB_REAUTHORIZATION_REQUIRED'
                ? 'GitHub requiere renovar la autorización. Ve a '
                : 'No se pudieron consultar tus organizaciones. Revisa el vínculo en '}
              <Link to="/account" className="underline">tu cuenta</Link>.{' '}
              <Button variant="outline" onClick={() => void query.organizations.refetch()}>Reintentar</Button>
            </p>
          )}
          {query.organizations.isSuccess && !organizations.length && <p>No hay organizaciones disponibles para tu cuenta.</p>}
          <label className="block text-sm">
            Organización
            <select className={field} value={organization} disabled={query.linkOrganization.isPending}
              onChange={(event) => setOrganization(event.target.value)}>
              <option value="">Selecciona una organización</option>
              {organizations.map((item) => <option key={item.id} value={item.login}>{item.login}</option>)}
            </select>
          </label>
          {query.organizations.hasNextPage && (
            <Button variant="outline" disabled={query.organizations.isFetchingNextPage}
              onClick={() => void query.organizations.fetchNextPage()}>Cargar más organizaciones</Button>
          )}
          {query.linkOrganization.isError && <p role="alert">No se pudo vincular la organización. Puedes reintentarlo desde el proyecto.</p>}
          <Button disabled={!organization || query.linkOrganization.isPending}
            onClick={() => query.linkOrganization.mutate({ projectId: projectToLink, organizationLogin: organization }, {
              onSuccess: () => {
                setProjectToLink(undefined);
                setNotice('Organización vinculada al proyecto.');
              },
            })}>
            {query.linkOrganization.isPending ? 'Vinculando…' : 'Vincular organización'}
          </Button>
        </Dialog>
      )}
    </section>
  );
}
