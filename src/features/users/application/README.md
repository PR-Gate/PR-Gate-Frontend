# users / application

Esta capa contiene operaciones reales de la sección Estudiantes:

- `GetCourseStudentsUseCase`: consulta el listado del curso mediante `StudentRepository`.
- `GetStudentContributionUseCase`: consulta la contribución de un estudiante dentro de un curso.

Los dos casos de uso reciben el puerto de dominio por constructor y propagan cancelación/errores. No conocen Axios, MSW, React ni los endpoints. `app/di/container.ts` conecta las implementaciones y los hooks de Presentation utilizan TanStack Query.

Implementar casos de uso inyectando puertos internos. No importar implementaciones HTTP, React ni Presentation.

Esta capa permanece cuando exista el backend. Se adaptarán API service, DTOs y mappers según el contrato real. Login conserva su flujo existente AuthProvider → AuthSessionService → adaptador OIDC/demo; no se ha modificado la autenticación.
