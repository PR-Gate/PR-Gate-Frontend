import { Link } from 'react-router';
import { Badge } from '@/shared/components/ui/badge';
import type { Project } from '../../domain/entities/project.entity';
export function ProjectTable({ projects }: { projects: readonly Project[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full min-w-[650px] text-left text-sm">
        <caption className="sr-only">Proyectos de tu espacio académico</caption>
        <thead className="border-b border-border bg-muted/60 text-xs text-muted-foreground">
          <tr>
            {['Proyecto', 'Curso', 'Estado', 'Integrantes'].map((label) => (
              <th scope="col" key={label} className="px-5 py-4 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-border last:border-0"
            >
              <th scope="row" className="px-5 py-5 font-semibold">
                <Link
                  to={`/projects/${project.id}`}
                  className="hover:underline"
                >
                  {project.name}
                </Link>
              </th>
              <td className="px-5 py-5 text-muted-foreground">
                {project.course}
              </td>
              <td className="px-5 py-5">
                <Badge
                  className={
                    project.status === 'archived'
                      ? 'bg-slate-100 text-slate-600'
                      : ''
                  }
                >
                  {project.status === 'active' ? 'Activo' : 'Archivado'}
                </Badge>
              </td>
              <td className="px-5 py-5 text-muted-foreground">
                {project.memberCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
