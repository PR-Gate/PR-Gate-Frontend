import { useState } from 'react';
import { RouterProvider } from 'react-router';
import type { AppDependencies } from './di/dependencies';
import { AppProviders } from './providers/app-providers';
import { createAppRouter } from './router/app-router';
export function App({
  dependencies,
  demo,
}: {
  dependencies: AppDependencies;
  demo: boolean;
}) {
  const [router] = useState(() => createAppRouter(demo));
  return (
    <AppProviders dependencies={dependencies}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
