import { useState } from 'react';
import { Link } from 'react-router';
import { FolderGit2, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { useRepositoryProjects } from '../hooks/use-repository-projects';

function hasErrorCode(error: unknown, code: string) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

export default function RepositoryProjectsPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [course, setCourse] = useState('');
  const [repository, setRepository] = useState<number | null>(null);
  const [organization, setOrganization] = useState('');
  const [notice, setNotice] = useState('');
  const query = useRepositoryProjects(open, page, course, organization);
  const organizations =
    query.organizations.data?.pages.flatMap((p) => p.items) ?? [];
  const courses = query.courses.data?.pages.flatMap((p) => p.items) ?? [];
  const repos = query.repos.data?.pages.flatMap((p) => p.items) ?? [];
  const catalog = query.catalog.data?.pages.flatMap((p) => p.items) ?? [];
  const admissions = query.admissions.data?.pages.flatMap((p) => p.items) ?? [];
  const picked = repos.find((r) => r.id === repository);
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
              ? 'Asocia un repositorio público de tu GitHub a uno de tus cursos.'
              : 'Crea tus cursos y revisa las solicitudes de estudiantes.'}
          </p>
        </div>
        {query.student && (
          <Button
            onClick={() => {
              query.select.reset();
              setOpen(true);
            }}
          >
            <FolderGit2 size={18} aria-hidden="true" />
            Seleccionar proyecto
          </Button>
        )}
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
          <h2 className="mt-8 text-lg font-semibold">Mis proyectos</h2>
          {query.selections.isPending && (
            <p role="status" className="my-4">
              Consultando tus proyectos…
            </p>
          )}
          {query.selections.isError && (
            <p role="alert" className="my-4 text-sm text-red-700">
              No se pudieron consultar tus proyectos.{' '}
              <Button
                variant="outline"
                onClick={() => void query.selections.refetch()}
              >
                Reintentar
              </Button>
            </p>
          )}
          {query.selections.isSuccess &&
            !query.selections.data.items.length && (
              <p className="my-5 rounded-xl border border-border bg-white p-6 text-sm text-muted-foreground">
                Todavía no tienes repositorios asociados. Pulsa «Seleccionar
                proyecto» para elegir uno.
              </p>
            )}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {query.selections.data?.items.map((item) => (
              <article
                key={item.projectId}
                className="rounded-xl border border-border bg-white p-6"
              >
                <h3 className="font-semibold">{item.repositoryFullName}</h3>
                <p className="my-3 text-sm text-muted-foreground">
                  {item.courseName} · {item.section} · {item.academicPeriod}
                </p>
                <a
                  href={item.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Ver repositorio público
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
          <div className="my-4 flex gap-3">
            <Button
              variant="outline"
              disabled={!page}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={!query.selections.data?.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
          <details className="mt-8 rounded-xl border border-border bg-white p-6">
            <summary className="cursor-pointer font-semibold">
              ¿No aparece tu curso? Solicitar acceso
            </summary>
            <p className="my-4 text-sm text-muted-foreground">
              Solo podrás seleccionar un curso cuando el docente apruebe tu
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
              <p className="break-all text-sm">Estudiante: {item.studentId}</p>
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
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!query.select.isPending) setOpen(value);
        }}
        title="Seleccionar proyecto"
        description="Elige un repositorio de tu cuenta u organización autorizado para PR Gate y el curso de destino."
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!picked || !course || query.select.isPending) return;
            query.select.mutate(
              { courseId: course, owner: picked.owner, name: picked.name },
              {
                onSuccess: (result) => {
                  setNotice(
                    'Proyecto ' +
                      result.repositoryFullName +
                      ' asociado a ' +
                      result.courseName +
                      '.',
                  );
                  setOpen(false);
                  setCourse('');
                  setRepository(null);
                  setPage(0);
                },
              },
            );
          }}
        >
          <fieldset disabled={query.select.isPending}>
            <legend className="mb-3 text-sm font-semibold">
              1. Repositorio de GitHub
            </legend>
            <label className="mb-3 block text-sm font-semibold">
              Cuenta u organización
              <select
                className={field}
                value={organization}
                onChange={(event) => {
                  setOrganization(event.target.value);
                  setRepository(null);
                }}
              >
                <option value="">Mi cuenta de GitHub</option>
                {organizations.map((item) => (
                  <option key={item.id} value={item.login}>
                    {item.login}
                  </option>
                ))}
              </select>
            </label>
            <p className="mb-3 text-sm text-muted-foreground">
              Se consultan las organizaciones y repositorios accesibles con tu
              autorización de GitHub. Los privados requieren instalar la App y
              permitir esos repositorios.
            </p>
            {query.organizations.isPending && (
              <p role="status">Consultando organizaciones…</p>
            )}
            {query.organizations.isSuccess && !organizations.length && (
              <p className="mb-3 text-sm text-muted-foreground">
                No se encontraron organizaciones accesibles con tu autorización.
              </p>
            )}
            {query.organizations.isError && (
              <div role="alert" className="mb-3 text-sm text-red-700">
                No se pudieron consultar las organizaciones.{' '}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void query.organizations.refetch()}
                >
                  Reintentar organizaciones
                </Button>
              </div>
            )}
            {query.organizations.hasNextPage && (
              <Button
                type="button"
                variant="outline"
                disabled={query.organizations.isFetchingNextPage}
                onClick={() => void query.organizations.fetchNextPage()}
              >
                Cargar más organizaciones
              </Button>
            )}
            {query.repos.isPending && <p role="status">Consultando GitHub…</p>}
            {query.repos.isError && (
              <div role="alert" className="text-sm text-red-700">
                {hasErrorCode(
                  query.repos.error,
                  'GITHUB_REAUTHORIZATION_REQUIRED',
                )
                  ? 'Renueva la autorización de GitHub en tu cuenta para consultar los repositorios.'
                  : hasErrorCode(
                        query.repos.error,
                        'GITHUB_TOKEN_STORAGE_UNAVAILABLE',
                      )
                    ? 'El backend necesita configurar la clave de cifrado de GitHub.'
                    : 'No se pudieron consultar los repositorios. Comprueba los permisos e instalación de la App y el límite de GitHub.'}{' '}
                <Link to="/account" className="underline">
                  Ver cuenta de GitHub
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void query.repos.refetch()}
                >
                  Reintentar
                </Button>
              </div>
            )}
            {query.repos.isSuccess && !repos.length && (
              <p className="text-sm text-muted-foreground">
                No hay repositorios accesibles en la cuenta u organización
                seleccionada.
              </p>
            )}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {repos.map((repo) => (
                <label
                  key={repo.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
                >
                  <input
                    type="radio"
                    name="repository"
                    checked={repository === repo.id}
                    onChange={() => setRepository(repo.id)}
                    className="mt-1"
                  />
                  <span className="min-w-0 text-sm">
                    <span className="block break-all font-semibold">
                      {repo.fullName}
                      {repo.privateRepository ? ' · Privado' : ' · Público'}
                      {repo.archived ? ' · Archivado' : ''}
                    </span>
                    <span className="mt-1 block text-muted-foreground">
                      {repo.description || 'Sin descripción'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {query.repos.hasNextPage && (
              <Button
                type="button"
                variant="outline"
                disabled={query.repos.isFetchingNextPage}
                onClick={() => void query.repos.fetchNextPage()}
              >
                Cargar más repositorios
              </Button>
            )}
          </fieldset>
          <label className="block text-sm font-semibold">
            2. Curso de destino
            <select
              required
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              className={field}
              disabled={query.select.isPending || query.courses.isPending}
            >
              <option value="">Selecciona un curso aprobado</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.section} · {c.academicPeriod}
                </option>
              ))}
            </select>
          </label>
          {moreCourses()}
          {query.courses.isSuccess && !courses.length && (
            <p className="text-sm text-muted-foreground">
              Aún no tienes cursos aprobados. Cierra esta ventana y solicita
              acceso a un curso.
            </p>
          )}
          {picked && course && (
            <p className="rounded-lg bg-muted p-3 text-sm">
              Se asociará <strong>{picked.fullName}</strong> al curso{' '}
              <strong>{courses.find((c) => c.id === course)?.name}</strong>.
              Podrás tener un proyecto activo por curso.
            </p>
          )}
          {query.select.isError && (
            <p role="alert" className="text-sm text-red-700">
              No se pudo asociar el proyecto. Verifica la admisión al curso, que
              tengas acceso al repositorio y que no tengas otro proyecto activo
              en ese curso.
            </p>
          )}
          <Button
            type="submit"
            disabled={
              !picked ||
              !course ||
              query.select.isPending ||
              query.courses.isError ||
              query.repos.isError
            }
          >
            {query.select.isPending ? 'Guardando…' : 'Confirmar selección'}
          </Button>
        </form>
      </Dialog>
    </section>
  );
}
