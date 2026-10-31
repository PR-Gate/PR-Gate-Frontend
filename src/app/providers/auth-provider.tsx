import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from '@/shared/services/auth/auth-context';
import type {
  AuthSessionService,
  LoginOptions,
  SessionUser,
} from '@/shared/services/auth/auth-session.service';
import type { QueryClient } from '@tanstack/react-query';
export function AuthProvider({
  service,
  queryClient,
  children,
}: {
  service: AuthSessionService;
  queryClient: QueryClient;
  children: ReactNode;
}) {
  const [state, setState] = useState<{
    user: SessionUser | null;
    loading: boolean;
    error: string | null;
  }>({ user: null, loading: true, error: null });
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const user = await service.getUser();
        if (active) setState({ user, loading: false, error: null });
      } catch {
        if (active)
          setState({
            user: null,
            loading: false,
            error: 'No se pudo recuperar la sesión. Vuelve a iniciar sesión.',
          });
      }
    };
    const unsubscribe = service.subscribe(() => {
      queryClient.clear();
      void refresh();
    });
    void refresh();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [service, queryClient]);
  const login = useCallback(
    async (options?: LoginOptions) => {
      try {
        setState((s) => ({ ...s, error: null }));
        await service.login(options);
      } catch {
        setState((s) => ({
          ...s,
          error:
            'No se pudo iniciar sesión. Verifica la configuración del proveedor.',
        }));
      }
    },
    [service],
  );
  const logout = useCallback(async () => {
    queryClient.clear();
    try {
      await service.logout();
    } catch {
      setState((s) => ({
        ...s,
        error: 'No se pudo cerrar la sesión del proveedor.',
      }));
    }
  }, [service, queryClient]);
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
