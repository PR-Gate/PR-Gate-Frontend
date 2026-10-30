import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ProjectsContext } from '@/features/projects/presentation/hooks/projects-context';
import { createQueryClient } from '../config/query-client.config';
import type { AppDependencies } from '../di/dependencies';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
export function AppProviders({
  dependencies,
  children,
}: {
  dependencies: AppDependencies;
  children: ReactNode;
}) {
  const [client] = useState(createQueryClient);
  return (
    <QueryProvider client={client}>
      <AuthProvider service={dependencies.auth} queryClient={client}>
        <ProjectsContext.Provider value={dependencies.projects}>
          {children}
          <Toaster richColors position="bottom-right" />
        </ProjectsContext.Provider>
      </AuthProvider>
    </QueryProvider>
  );
}
