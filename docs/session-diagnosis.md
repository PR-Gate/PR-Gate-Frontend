# Diagnóstico de sesión local — 11 de noviembre de 2026

## Entorno comprobado antes del cambio

- Frontend: rama `develop`, proceso Vite PID 24324, iniciado con
  `--config vite.keycloak.config.ts`, escuchando en `127.0.0.1:5173`.
- Configuración servida por Vite: OIDC/Keycloak, mocks `false`, base API `/api`,
  issuer `http://localhost:8090/realms/prgate`, cliente `prgate-frontend`.
- Proxy: navegador `http://localhost:5173/api` → users-service
  `http://localhost:8080/api`. La petición de sesión es POST, no GET.
- Backend: imagen `users-service:0.0.1`, perfiles efectivos `local,keycloak`.
  El log confirma esos perfiles y `Started UsersServiceApplication`.
- Sin sobrescrituras de issuer/JWKS/audience/client por variables de entorno,
  argumentos del contenedor, `SPRING_APPLICATION_JSON` ni opciones Java.
  Se aplican los valores de `application-keycloak.yml`:
  issuer público anterior, audiencia `prgate-api`, cliente `prgate-frontend`,
  JWKS `http://host.docker.internal:8090/realms/prgate/protocol/openid-connect/certs`.
- JWKS consultado desde users-service: HTTP 200. La firma del access token real
  también se verificó con RSA-SHA256 y las claves públicas de ese realm.

## Reproducción real

El usuario abrió `/account` y pulsó Reintentar conexión. Una traza temporal en
el proxy registró la petición real sin almacenar encabezados, JWT, nombres,
correos ni identificadores del usuario. El reporte anterior a la corrección está
en [session-audit.before.json](session-audit.before.json).

Ejemplo del 11 de noviembre, 19:43:53 (America/Lima):

| Campo                           | Resultado                              |
| ------------------------------- | -------------------------------------- |
| Método                          | POST                                   |
| URL frontend                    | `http://localhost:5173/api/me/session` |
| URL backend                     | `http://localhost:8080/api/me/session` |
| Estado / código                 | `401 / AUTHENTICATION_REQUIRED`        |
| Bearer presente                 | Sí                                     |
| Firma RS256 válida              | Sí                                     |
| iss, aud, azp, typ, vencimiento | Coinciden                              |
| sub válido                      | **No**                                 |

La traza emite el registro redactado con el prefijo `[local-session-audit]` en
el servidor Vite. El backend devuelve el código genérico de autenticación; su
implementación no registra los motivos individuales del rechazo JWT. No se
atribuyó una excepción de base de datos a ese 401.

También se observó un GET manual a `/api/me/session`, sin Bearer, con HTTP 405.
Ese GET no representa la petición de la aplicación. No hubo un bloqueo de proxy
o CORS: el POST real llegó al servicio y su respuesta fue recibida por el cliente.

## Causa y cambio mínimo

El realm importado define scopes personalizados (`profile`, `email`, `prgate-api`)
y no incluía un mapper que agregara un sub válido al access token. El ID token
sí puede identificar al usuario; por eso la UI mostraba “Sesión iniciada”, aunque
el backend no podía resolver su identidad con el access token.

La corrección añade **Subject (sub)** (`oidc-sub-mapper`) al scope `prgate-api`,
que ya es un scope predeterminado del cliente. Se mantiene la exigencia de sub,
firma, issuer, audiencia, cliente, tipo, vencimiento y perfil académico activo.

Archivo del backend corregido: `infra/keycloak/prgate-realm.json`.
El JSON sirve para importaciones nuevas; no modifica un realm ya persistido.
En ese realm, el usuario agrega el mismo mapper desde la consola de Keycloak,
sin ejecutar SQL, borrar usuarios, recrear bases ni reiniciar el servicio de usuarios.

Referencia oficial: [mapper Subject (sub)](https://www.keycloak.org/admin-api/protocol-mappers)
y [cambio de Keycloak que trasladó sub al scope basic / protocol mappers](https://www.keycloak.org/docs/26.3.5/upgrading/).

## Verificación que debe cerrarse con una sesión nueva

1. Guardar Subject (sub), con Add to access token activado, en
   realm prgate → Client scopes → prgate-api → Mappers.
2. Cerrar sesión en PR Gate y volver a entrar, para emitir un access token nuevo.
3. Confirmar que POST `/api/me/session` devuelve un perfil válido. Si falta el
   registro académico, debe devolver `404 / ACADEMIC_PROFILE_REQUIRED` y permitir
   elegir Estudiante, sin saltarse esa condición.
4. Confirmar el perfil `STUDENT / ACTIVE` y que Vincular cuenta de GitHub quede
   habilitado. Un `404 / GITHUB_NOT_LINKED` es un estado normal sin vínculo;
   no debe convertirse en un error de sesión.

La validación final con la sesión nueva está pendiente; no se afirma un éxito
solo por tener pruebas unitarias o una respuesta pública 401 de control.
