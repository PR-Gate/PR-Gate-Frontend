import { mergeConfig } from 'vite';
import base from './vite.config.ts';
import { createLocalSessionAudit } from './tools/local-session-audit';

const sessionAudit = createLocalSessionAudit();

// Explicit local identity-provider mode. Never imports any .env file.
export default mergeConfig(base, {
  envDir: false,
  plugins: [sessionAudit.plugin],
  server: {
    // Keep the listener on IPv4 loopback; resolving "localhost" can select only ::1.
    // Public OIDC URLs intentionally remain http://localhost:5173.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/v1': { target: 'http://localhost:8083', changeOrigin: true },
      '/api': sessionAudit.proxy,
    },
  },
  define: {
    'import.meta.env.VITE_AUTH_MODE': JSON.stringify('oidc'),
    'import.meta.env.VITE_OIDC_PROVIDER': JSON.stringify('keycloak'),
    'import.meta.env.VITE_ENABLE_MOCKS': JSON.stringify('false'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api'),
    'import.meta.env.VITE_OIDC_AUTHORITY': JSON.stringify(
      'http://localhost:8090/realms/prgate',
    ),
    'import.meta.env.VITE_OIDC_CLIENT_ID': JSON.stringify('prgate-frontend'),
    'import.meta.env.VITE_OIDC_REDIRECT_URI': JSON.stringify(
      'http://localhost:5173/login',
    ),
    'import.meta.env.VITE_OIDC_LOGOUT_URI': JSON.stringify(
      'http://localhost:5173/login',
    ),
  },
});
