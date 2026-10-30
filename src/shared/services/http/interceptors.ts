import axios, { type AxiosInstance } from 'axios';
import { HttpError } from './http-error';

export function installInterceptors(
  client: AxiosInstance,
  getToken: () => Promise<string | undefined>,
  onUnauthorized: () => Promise<void>,
) {
  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (axios.isCancel(error)) throw error;
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0;
        if (status === 401) await onUnauthorized();
        throw new HttpError(
          status === 401
            ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
            : status === 403
              ? 'No tienes permiso para esta operación.'
              : status === 0
                ? 'No se pudo conectar con el servidor.'
                : 'No se pudo completar la solicitud.',
          status,
          error.code,
        );
      }
      throw error;
    },
  );
}
