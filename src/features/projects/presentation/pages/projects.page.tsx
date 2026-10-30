import { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import { useAuth } from '@/shared/services/auth/auth-context';
import { useProjects } from '../hooks/use-projects';
import { ProjectCard } from '../components/project-card';
import { ProjectForm } from '../components/project-form';
import { ProjectTable } from '../components/project-table';

export default function ProjectsPage() {
  const query = useProjects();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const projects = query.data ?? [];
  const filtered = projects.filter(
    (project) =>
      `${project.name} ${project.course}`
        .toLocaleLowerCase('es')
        .includes(search.toLocaleLowerCase('es')) &&
      (status === 'all' || project.status === status),
  );
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">TU ESPACIO DE TRABAJO</p>
          <h1 className="page-title">Proyectos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ideas que se convierten en software. Evidencia que se convierte en
            aprendizaje.
          </p>
        </div>
        {user?.roles.some((role) => ['TEACHER', 'ADMIN'].includes(role)) && (
          <Button onClick={() => setOpen(true)}>
            <Plus size={17} />
            Nuevo proyecto
          </Button>
        )}
      </div>
      <div className="my-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Proyectos registrados',
            count: projects.length,
            note: 'En tu espacio académico',
            icon: '01',
          },
          {
            label: 'En desarrollo',
            count: projects.filter((p) => p.status === 'active').length,
            note: 'Proyectos activos',
            icon: '02',
          },
          {
            label: 'Archivados',
            count: projects.filter((p) => p.status === 'archived').length,
            note: 'Historial de proyectos',
            icon: '03',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <span className="font-mono text-xs text-slate-300">
                {stat.icon}
              </span>
            </div>
            <p className="my-2 text-3xl font-semibold tracking-tight">
              {query.isPending || query.isError ? '—' : stat.count}
            </p>
            <p className="text-xs text-muted-foreground">{stat.note}</p>
          </div>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FolderKanban size={18} className="text-emerald-800" />
          <h2 className="text-base font-semibold">Todos los proyectos</h2>
          <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-xs">
            {query.isSuccess ? filtered.length : '—'}
          </span>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search
              size={16}
              className="absolute top-3 left-3 text-slate-400"
            />
            <input
              className="input pl-9"
              placeholder="Buscar proyecto o curso…"
              aria-label="Buscar proyectos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm">
            <SlidersHorizontal size={14} />
            <span className="sr-only">Filtrar por estado</span>
            <select
              aria-label="Estado del proyecto"
              className="h-10 bg-transparent"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="archived">Archivados</option>
            </select>
          </label>
        </div>
      </div>
      <div
        className="mb-4 flex justify-end gap-1"
        role="group"
        aria-label="Vista de proyectos"
      >
        <Button
          variant="outline"
          size="icon"
          aria-label="Vista de tarjetas"
          aria-pressed={view === 'grid'}
          onClick={() => setView('grid')}
        >
          <LayoutGrid size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Vista de tabla"
          aria-pressed={view === 'table'}
          onClick={() => setView('table')}
        >
          <List size={16} />
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title={projects.length ? 'No hay coincidencias' : undefined}
          description={
            projects.length
              ? 'Prueba con otro nombre, curso o estado.'
              : undefined
          }
        />
      ) : view === 'table' ? (
        <ProjectTable projects={filtered} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
      <p className="mt-7 text-xs text-muted-foreground">
        Los resultados de evaluación y Quality Gates se obtienen del servicio de
        auditoría técnica.
      </p>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Nuevo proyecto"
        description="Organiza el trabajo de tu equipo y conecta su repositorio."
      >
        <ProjectForm onSuccess={() => setOpen(false)} />
      </Dialog>
    </section>
  );
}
