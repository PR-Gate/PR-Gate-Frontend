import { Suspense } from 'react';
import { Outlet } from 'react-router';
export function MainLayout() {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-10">
          Cargando página…
        </p>
      }
    >
      <Outlet />
    </Suspense>
  );
}
