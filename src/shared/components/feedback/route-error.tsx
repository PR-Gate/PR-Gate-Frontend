import { isRouteErrorResponse, useRouteError } from 'react-router';
export function RouteError() {
  const error = useRouteError();
  return (
    <main className="mx-auto max-w-xl p-12">
      <h1 className="text-2xl font-bold">No se pudo abrir esta página</h1>
      <p className="my-4">
        {isRouteErrorResponse(error)
          ? `${error.status} · ${error.statusText}`
          : 'Ocurrió un error inesperado. Intenta recargar la página.'}
      </p>
      <a href="/" className="underline">
        Volver al inicio
      </a>
    </main>
  );
}
