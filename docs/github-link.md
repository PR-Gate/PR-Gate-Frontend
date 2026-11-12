# Vincular cuenta de GitHub

El estudiante encuentra **Mi perfil → Cuenta de GitHub**. La pantalla `/account`
también muestra la integración pendiente cuando una sesión de Keycloak aún no
tiene perfil académico. La demo mantiene el botón deshabilitado y no simula una
autorización exitosa.

El login público no incluye un botón de vinculación que redirija a Keycloak.
Primero se inicia sesión en PR Gate; el botón de la cuenta del estudiante
solicita la autorización al backend y abre directamente GitHub, sin invocar
el login OIDC. GitHub presenta el acceso, la selección de cuenta o el consentimiento
según la sesión existente en su propio sitio.

La implementación respeta el flujo componente → TanStack Query → caso de uso →
repositorio → API service → HttpClient. Usa el contrato existente en
`PR-Gate-Backend/users-service`:

- `GET /api/me/integrations/github`: consulta el vínculo. Solo un 404 con código
  `GITHUB_NOT_LINKED` representa una cuenta sin vincular; un endpoint ausente es
  un error de integración.
- `POST /api/me/integrations/github/authorization`: inicia OAuth y recibe
  `authorizationUrl` y `expiresAt`. El navegador conserva la cookie HttpOnly con
  solicitudes con credenciales. Solo se admiten URLs de autorización HTTPS de GitHub.
- GitHub vuelve a `GET /api/integrations/github/callback`, administrado por el
  backend. Actualmente devuelve JSON en la pestaña de autorización. El estudiante
  regresa a PR Gate y pulsa **Actualizar estado**; la UI solo confirma el vínculo
  tras consultar nuevamente al backend. También se vuelve a consultar al recuperar
  el foco de la ventana.

No se solicitan secretos, tokens de GitHub ni UUID manuales en el frontend.
La autorización de usuario y la instalación de la App son pasos distintos:
los repositorios privados requieren que la App esté instalada y autorizada
para esos repositorios. Ver [activación de repositorios privados](github-private.md).

## Conexión de perfiles con Keycloak

El frontend compone la sesión OIDC con `createBackendSession`, que llama a
`POST /api/me/session` con el bearer de Keycloak. La respuesta proporciona
`id`, `name`, `email`, `role` y `status` oficiales. Ante errores, conserva la
identidad autenticada pero no concede roles académicos; muestra un diagnóstico
y permite reintentar desde `/account`. Un 404 identifica una versión antigua
del backend, sin confundirlo con una caída de PostgreSQL.

La obtención del access token espera a que termine la inicialización OIDC,
incluido el callback. Los clientes de sesión/perfil y GitHub exigen un token
antes de enviar la petición; si falta, se muestra un diagnóstico y no se envía
una solicitud anónima al backend. Los tokens de Keycloak siguen solo en memoria del navegador; las
credenciales de GitHub se cifran exclusivamente en el backend. El adaptador
de demo se carga mediante importación dinámica exclusivamente en el modo demo.

La adaptación se incorporó a `PR-Gate-Backend/users-service`. El overlay
`compose.users-keycloak.yml` activa los perfiles `local,keycloak`: las cookies
permiten HTTP en localhost, pero la identidad GitHub exige un JWT Keycloak,
sin aceptar `X-User-Id`. Se validan firma RS256, issuer, expiración, audiencia
`prgate-api`, cliente `prgate-frontend` y tipo de access token.

V3 agrega `users.external_identities` para relacionar issuer + subject con un
UUID académico independiente; no enlaza perfiles por correo ni trata el sub
como UUID de PR Gate. El backend rechaza perfiles INACTIVE.

El registro comienza en `/register`, con la elección Docente/Estudiante antes
de continuar con Keycloak. La preferencia se conserva temporalmente en
sessionStorage; no es un permiso. Después de autenticarse, el frontend envía
esa elección a `POST /api/me/registration`. El backend solo acepta `teacher`
o `student` para crear un perfil inicial; nunca permite ADMIN ni cambia el rol
de un usuario existente por repetir el registro.

`POST /api/me/session` consulta el perfil, sin crearlo implícitamente. Un 404 con
`ACADEMIC_PROFILE_REQUIRED` distingue una identidad válida sin registro académico
de un endpoint ausente. Si la cuenta ya existía en Keycloak pero no en PR Gate,
`/account` permite elegir el perfil y guardarlo sin crear otra identidad Keycloak.

Los cambios de backend requieren reconstruir y actualizar la imagen local. Ese arranque
aplica V3 sobre la base existente, por lo que lo ejecuta el usuario. También
debe configurar `GITHUB_ENABLED=true` y la callback exacta de su GitHub App.
Los secretos permanecen en `users-service/.env`, nunca en el frontend.

## Auditoría local del 11 de noviembre de 2026

- Docker y los logs mostraron users-service activo con una imagen antigua de
  Spring Boot 3.4.4. Swagger respondía 200, pero no incluía `/api/me` ni GitHub;
  ambas consultas sin autenticación respondían 404. El código actual utiliza
  Spring Boot 3.5.16. No era suficiente añadir un botón ni reiniciar Vite.
- El usuario confirmó en pgAdmin que la base correcta es **PR-Gate**, con
  `users.users`, `public.users` y V1/V2 exitosas en
  `users.flyway_schema_history`. No mover ni borrar tablas, no usar baseline
  y no modificar la base `prgate_ai`.
- El contenedor tenía Client ID y secreto configurados, pero GitHub desactivado.
  La auditoría solo mostró indicadores de configuración, sin leer registros de
  la base ni imprimir credenciales.
- La compilación backend y 7 pruebas de identidad/JWT/configuración pasaron sin
  crear ni conectar bases de datos. No se ejecutaron las pruebas backend H2.
- Tras la actualización ejecutada por el usuario, el log confirmó Spring Boot
  3.5.16, perfiles `local,keycloak`, V3 aplicada correctamente y
  `Started UsersServiceApplication`. Swagger publica sesión, perfil y GitHub;
  las consultas sin bearer a `/api/me` y al vínculo responden 401.
- Desde el contenedor, la consulta pública al JWKS de Keycloak respondió 200.
  No se usaron tokens ni se consultaron registros de la base en esta comprobación.
- La vinculación real queda pendiente de que el usuario inicie sesión y autorice
  su GitHub App. No reportar éxito hasta que `GET /api/me/integrations/github`
  confirme la cuenta.

Los comandos y la explicación de la migración están en
`PR-Gate-Backend/KEYCLOAK-GITHUB-RECOVERY.md`.

Una comprobación posterior encontró el contenedor iniciado solo con `local`,
sin `/api/me/session`. `compose.yml` ahora conserva `local,keycloak` también en
el arranque habitual, configurable con `USERS_AUTH_PROFILES`. El registro explícito
no añade migraciones nuevas sobre V3. Las pruebas backend de perfiles y contrato
HTTP se ejecutan sin base de datos.

`npm run dev` y `npm run dev:keycloak` incluyen un proxy `/api` hacia `http://localhost:8080`,
según el puerto documentado de users-service. En otros despliegues se necesita
un proxy del mismo origen o CORS explícito con credenciales. La dirección del
callback registrada en GitHub debe coincidir con la configurada en el backend;
en local se debe conservar el host `localhost` para compartir la cookie entre
los puertos de desarrollo y del callback.

Las pruebas HTTP usan Axios y MSW sin contactar GitHub ni la base del usuario.
