# Repositorios privados de GitHub

El selector de proyectos consulta repositorios de la cuenta vinculada y sus
organizaciones con un **GitHub App user access token**. La cuenta debe tener
acceso y la instalación debe autorizar el repositorio privado. La pertenencia
activa a la organización se comprueba al listar y seleccionar sus proyectos.
Se conservan la autenticación Keycloak y el requisito de estudiante activo
con admisión aprobada al curso.

## Activación local por el usuario

1. Respalda **PR-Gate** desde pgAdmin. No crees otra base para GitHub.
2. En PowerShell, genera una clave y copia la línea de configuración al portapapeles:

   ```powershell
   $githubKeyBytes = New-Object byte[] 32
   $githubRandom = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $githubRandom.GetBytes($githubKeyBytes)
   $githubRandom.Dispose()
   Set-Clipboard -Value ('GITHUB_TOKEN_ENCRYPTION_KEY=' + [Convert]::ToBase64String($githubKeyBytes))
   ```

3. Pega la línea en **PR-Gate-Backend/users-service/.env**, conserva los demás
   valores y guarda. No compartas la clave ni la añadas a Git. Conserva un
   respaldo privado de ella junto al respaldo de la base: sustituirla impide
   descifrar autorizaciones existentes.
4. Desde **PR-Gate-Backend**, ejecuta:

   ```powershell
   docker compose -f compose.yml -f compose.users-keycloak.yml up -d --build --no-deps users-service
   docker compose -f compose.yml -f compose.users-keycloak.yml logs --tail=80 users-service
   ```

   Flyway aplica `V4__encrypted_github_access.sql` en tu base existente,
   añadiendo únicamente dos columnas a `users.github_account_links`. No modifica
   V1–V3, roles, perfiles académicos ni identidades vinculadas.

5. En `/account`, pulsa **Renovar autorización de GitHub**, autoriza la misma
   cuenta y vuelve a PR Gate. En `/projects`, abre **Seleccionar proyecto**.
   Elige **Mi cuenta** o una organización y comprueba que aparece el repositorio
   autorizado con la etiqueta **Privado**.

Si falta un repositorio, revisa Settings → Applications → Installed GitHub Apps
→ Configure de la cuenta u organización propietaria. Selecciónalo en Repository
access y acepta los permisos pendientes. Para organizaciones, la App requiere
Members de lectura y la aprobación correspondiente.

## Tratamiento de credenciales y errores

- AES-256-GCM con nonce aleatorio y datos asociados al UUID académico + ID GitHub.
  La base guarda únicamente el token cifrado y su caducidad. Los DTO públicos no
  contienen credenciales; las respuestas de repositorios usan `Cache-Control: no-store`.
- Renovar solo permite la misma identidad GitHub. No cambia el UUID académico
  ni permite sustituir una cuenta ya vinculada. Desvincular elimina también el
  token cifrado porque reside en la misma fila.
- Se guarda el access token, sin conservar refresh tokens. Cuando caduca o es
  revocado, el usuario debe renovar la autorización explícitamente.
- `GITHUB_REAUTHORIZATION_REQUIRED` (409): falta token, caducó o fue revocado;
  no implica que haya caducado la sesión Keycloak.
- `GITHUB_TOKEN_STORAGE_UNAVAILABLE` (503): clave de cifrado ausente o incompatible.
- `GITHUB_REPOSITORY_ACCESS_DENIED` (403): permisos/instalación insuficientes,
  repositorio inaccesible o membresía no activa. No se reenvían mensajes privados de GitHub.
- `GITHUB_RATE_LIMITED` (429): GitHub pidió limitar consultas.

Las pruebas automatizadas de esta entrega no consultan ni modifican la base
del usuario. La migración y la lectura real del repositorio privado quedan por
verificar después del arranque y la autorización realizados por el usuario.

Referencias: [autenticación de GitHub App en nombre del usuario](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-a-github-app-on-behalf-of-a-user),
[repositorios del usuario autenticado](https://docs.github.com/en/rest/repos/repos#list-repositories-for-the-authenticated-user).
