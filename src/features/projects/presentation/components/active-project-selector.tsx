import { useEffect } from 'react';
import { ChevronsUpDown, FolderKanban } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useActiveProject } from '../hooks/use-active-project';

export function ActiveProjectSelector() {
  const { active, projects, catalog, selectProject } = useActiveProject();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const nested = pathname.match(/^\/projects\/([^/]+)(\/.*)?$/);
  const queryProject = new URLSearchParams(search).get('projectId');
  const routeProject = nested?.[1] ?? queryProject;
  const selection = projects.find((project) => project.id === routeProject) ?? active;

  useEffect(() => {
    if (routeProject && selection?.id === routeProject && active?.id !== routeProject) {
      selectProject(routeProject);
    }
  }, [active?.id, routeProject, selection?.id, selectProject]);

  return (
    <div className="dashboard-sidebar-expanded mx-4 mb-8 rounded-lg border border-white/10 bg-white/5 p-3">
      <label htmlFor="active-project" className="flex items-center gap-2 text-xs font-medium text-white/75">
        <FolderKanban size={16} className="text-sidebar-highlight" aria-hidden="true" />
        Proyecto activo
      </label>
      <div className="relative mt-2">
        <select
          id="active-project"
          value={selection?.id ?? ''}
          disabled={catalog.isPending || catalog.isError || projects.length === 0}
          className="w-full appearance-none truncate rounded-md border border-white/15 bg-sidebar py-2 pl-2 pr-7 text-xs text-white focus-visible:outline focus-visible:outline-sidebar-highlight disabled:text-white/60"
          onChange={(event) => {
            const id = event.target.value;
            selectProject(id);
            if (nested) {
              void navigate(id ? `/projects/${encodeURIComponent(id)}${nested[2] ?? ''}${search}${hash}` : '/projects');
            } else if (queryProject) {
              const params = new URLSearchParams(search);
              params.delete('projectId');
              void navigate({ pathname, search: params.toString(), hash }, { replace: true });
            }
          }}
        >
          <option value="" disabled>
            {catalog.isPending ? 'Cargando proyectos…' : projects.length ? 'Selecciona un proyecto' : 'Sin proyectos disponibles'}
          </option>
          {catalog.data?.filter(({ projects: options }) => options.length > 0).map(({ course, projects: options }) => (
            <optgroup key={course.id} label={`${course.name} · ${course.section}`}>
              {options.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </optgroup>
          ))}
        </select>
        <ChevronsUpDown size={14} aria-hidden="true" className="pointer-events-none absolute right-2 top-2 text-white/55" />
      </div>
      {catalog.isError && (
        <button type="button" onClick={() => void catalog.refetch()} className="mt-2 text-xs text-sidebar-highlight underline">
          Reintentar carga
        </button>
      )}
    </div>
  );
}
