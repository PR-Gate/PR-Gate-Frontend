import { ArrowUpRight, GitBranch, Users, Clock3 } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@/shared/components/ui/badge';
import {
  canOpenRepository,
  type Project,
} from '../../domain/entities/project.entity';
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-800">
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        <Badge
          className={
            project.status === 'archived' ? 'bg-slate-100 text-slate-600' : ''
          }
        >
          <span
            className={`size-1.5 rounded-full ${project.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {project.status === 'active' ? 'Activo' : 'Archivado'}
        </Badge>
      </div>
      <p className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {project.course}
      </p>
      <h2 className="text-lg font-semibold tracking-tight">
        <Link
          to={`/projects/${project.id}`}
          className="flex items-start justify-between gap-2 hover:text-emerald-800"
        >
          {project.name}
          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-slate-400 group-hover:text-emerald-700"
          />
        </Link>
      </h2>
      <p className="mt-3 mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      {canOpenRepository(project) && (
        <a
          href={project.repositoryUrl ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="mb-5 flex items-center gap-2 truncate text-xs text-slate-600 hover:text-emerald-800"
        >
          <GitBranch size={14} />
          <span className="truncate">
            {project.repositoryUrl?.replace('https://', '')}
          </span>
        </a>
      )}
      <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users size={14} />
          {project.memberCount} integrantes
        </span>
        <span className="flex items-center gap-1.5">
          <Clock3 size={13} />
          {new Intl.DateTimeFormat('es-PE', {
            day: 'numeric',
            month: 'short',
            timeZone: 'America/Lima',
          }).format(project.updatedAt)}
        </span>
      </div>
    </article>
  );
}
