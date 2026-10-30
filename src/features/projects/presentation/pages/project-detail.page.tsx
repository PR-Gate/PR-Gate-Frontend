import { Link, useParams } from 'react-router';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  ErrorState,
  LoadingState,
} from '@/shared/components/feedback/async-state';
import { useProject } from '../hooks/use-projects';
import { canOpenRepository } from '../../domain/entities/project.entity';
export default function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const query = useProject(projectId);
  if (query.isPending) return <LoadingState />;
  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  const project = query.data;
  return (
    <section>
      <Link
        to="/projects"
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={15} />
        Todos los proyectos
      </Link>
      <p className="eyebrow">{project.course}</p>
      <h1 className="page-title">{project.name}</h1>
      <div className="mt-6 rounded-xl border border-border bg-white p-7">
        <Badge>{project.status === 'active' ? 'Activo' : 'Archivado'}</Badge>
        <p className="my-5 text-muted-foreground">{project.description}</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Integrantes</dt>
            <dd className="mt-1 font-semibold">{project.memberCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              Última actualización
            </dt>
            <dd className="mt-1 font-semibold">
              {project.updatedAt.toLocaleDateString('es-PE', {
                timeZone: 'America/Lima',
              })}
            </dd>
          </div>
        </dl>
        {canOpenRepository(project) && (
          <Button asChild variant="outline" className="mt-6">
            <a
              href={project.repositoryUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
            >
              Abrir repositorio
              <ExternalLink size={14} />
            </a>
          </Button>
        )}
      </div>
      <nav
        aria-label="Información del proyecto"
        className="mt-6 flex flex-wrap gap-3"
      >
        {[
          ['pipelines', 'Pipelines'],
          ['quality-gates', 'Quality Gates'],
          ['metrics', 'Métricas'],
        ].map(([path, title]) => (
          <Button asChild variant="outline" key={path}>
            <Link to={`/projects/${projectId}/${path}`}>{title}</Link>
          </Button>
        ))}
      </nav>
    </section>
  );
}
