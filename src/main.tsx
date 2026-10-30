import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { readEnvironment } from './app/config/env.config';
import { createDependencies } from './app/di/container';
import { createDemoSession } from './features/users/infrastructure/auth/demo-session.adapter';
import { App } from './app/app';
import './shared/styles/globals.css';

async function bootstrap() {
  const config = readEnvironment(import.meta.env, import.meta.env.PROD);
  if (config.VITE_ENABLE_MOCKS === 'true') {
    const { startMocks } = await import('./testing/mocks/browser');
    await startMocks(config.VITE_API_BASE_URL);
  }
  const auth =
    config.VITE_AUTH_MODE === 'demo'
      ? createDemoSession()
      : (
          await import('./features/users/infrastructure/auth/oidc-session.adapter')
        ).createOidcSession({
          authority: config.VITE_OIDC_AUTHORITY!,
          clientId: config.VITE_OIDC_CLIENT_ID!,
          redirectUri: config.VITE_OIDC_REDIRECT_URI!,
          logoutUri: config.VITE_OIDC_LOGOUT_URI!,
          cognitoLogoutUrl: config.VITE_COGNITO_LOGOUT_URL!,
        });
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App
        dependencies={createDependencies(config.VITE_API_BASE_URL, auth)}
        demo={config.VITE_AUTH_MODE === 'demo'}
      />
    </StrictMode>,
  );
}
void bootstrap().catch((error) => {
  console.error('Error de inicio', error);
  const root = document.getElementById('root');
  if (root) {
    root.textContent =
      'No se pudo iniciar PR Gate. Revisa las variables de entorno: copia .env.example a .env para la demostración local o configura OIDC para producción.';
    root.setAttribute('role', 'alert');
    root.style.padding = '2rem';
  }
});
