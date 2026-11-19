import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ErrorState, LoadingState } from '@/shared/components/feedback/async-state';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import { RepositoryProjectsContext } from '../hooks/use-repository-projects';

export default function LiveProjectDetailPage() {
  const api = useContext(RepositoryProjectsContext);
  if (!api) throw new Error('RepositoryProjectsContext es obligatorio');
  const { user } = useAuth();
  const { projectId = '' } = useParams();
  const query = useQuery({
    queryKey: ['repository-projects', user?.id, 'detail', projectId],
    queryFn: ({ signal }) => api.projectDetails(projectId, signal),
  });
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const project = query.data;
  const base = `/projects/${project.id}`;
  return (
    <section className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft size={16} />Proyectos</Link>
      <header><h1 className="page-title">{project.name}</h1>
        {project.description && <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>}
      </header>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Información del proyecto</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Organización de GitHub</dt>
            <dd className="mt-1">{project.organizationLogin ? <Badge>{project.organizationLogin}</Badge> : 'Por vincular'}</dd></div>
          <div><dt className="text-muted-foreground">Fecha de creación</dt>
            <dd className="mt-1 font-medium">{new Date(project.createdAt).toLocaleDateString('es-PE')}</dd></div>
        </dl>
      </div>
      <nav className="flex flex-wrap gap-3" aria-label="Información del proyecto">
        {user?.roles.includes('STUDENT') && (
          <Button asChild variant="outline"><Link to={`/pipelines?projectId=${encodeURIComponent(project.id)}`}><GitBranch size={16} />Ejecuciones CI/CD</Link></Button>
        )}
        <Button asChild variant="outline">
          <Link to={`${base}/quality-gates?courseId=${encodeURIComponent(project.courseId)}`}>Quality Gate y evaluación</Link>
        </Button>
      </nav>
    </section>
  );
}
