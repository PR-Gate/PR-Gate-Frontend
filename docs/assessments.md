# Tests y evaluaciones

## Estado actual

Feature funcional de autoría y revisión académica, exclusiva del rol `TEACHER`. No aparece en la navegación del estudiante ni de un administrador que no tenga también rol docente. Los guards protegen listado y detalle, incluso mediante URL directa. La autorización real deberá verificarse en el backend cuando exista.

Para explorar: `npm run dev`, entrar como **Docente** y abrir **Tests y evaluaciones** en la sidebar. Rutas: `/teacher/evaluations` y `/teacher/evaluations/:testId`. Los enlaces de tests publicados abren Estudiantes; los finalizados abren Resultados.

Toda la información procede de **MSW**. No se envía correo real, no se publican tests a alumnos reales y no hay integración con un LMS o microservicio real. Los cambios y recordatorios viven en memoria de los handlers; recargar la aplicación reinicia las fixtures. No se guardan respuestas, contraseñas ni bancos de preguntas en localStorage.

## Comportamiento implementado

- Inicio con tres pasos orientativos, tres indicadores, búsqueda por título/curso y lista con Borrador, Programado, Publicado y Finalizado.
- Asistente de tres pasos: datos, preguntas y alumnos. El puntaje total de autoría permanece visible; esto no es una calificación de alumnos.
- Preguntas de selección múltiple, verdadero/falso y abiertas, con puntaje y feedback opcional. Crear, editar, eliminar, reordenar con botones accesibles y copiar desde un banco simulado. Las preguntas copiadas reciben IDs independientes.
- Asignación a todo el curso, equipos o alumnos individuales, con selección de destinatarios. Cambiar de curso reinicia la selección para evitar IDs de otro curso.
- Fechas de apertura/cierre expresadas en **America/Lima (UTC−05:00)** y serializadas como instantes ISO. El contrato futuro debe confirmar zona horaria y restricciones de duración/fechas.
- Guardado de borradores incompletos, publicación con confirmación y programación si la apertura es futura. Se guarda primero un borrador; si publicar falla, la edición conserva su ID para reintentar sin duplicar el test.
- Editar un test programado y guardarlo como borrador retira su programación; la UI avisa y permite confirmar una nueva publicación. Los tests publicados/finalizados no se pueden editar desde el mock.
- Detalle con Resumen, Preguntas, Estudiantes y Resultados; pestañas con navegación por teclado.
- Recordatorios simulados para alumnos sin entrega, informados como simulados. Los handlers registran destinatarios y rechazan recordatorios para tests no publicados.
- Revisión de respuestas con puntajes por pregunta y retroalimentación del docente. Las preguntas abiertas se identifican como “Requiere revisión docente”. El docente confirma también los puntajes de preguntas cerradas; una sugerencia técnica nunca es una decisión final.
- Promedio de calificaciones confirmadas, participación, información de dificultad, distribución y acompañamiento devueltos por el servicio simulado. No se infiere rendimiento ni se evalúa con IA desde React.

## Arquitectura

`features/assessments` es una feature frontend de autoría/revisión; no presupone un séptimo microservicio ni cambia los seis dominios del backend de la solución.

```text
Presentation (página/formulario/hook Query)
  → Application (caso de uso)
  → Domain (AssessmentRepository)
  ← Infrastructure (repository + mapper + API service + Zod)
  → HttpClient / Axios → MSW
```

Domain contiene los modelos y el puerto, sin React/Axios. Application tiene operaciones explícitas de listado, detalle, catálogo, guardado, publicación, recordatorio y revisión. Infrastructure encapsula rutas y DTOs externos y convierte contadores snake_case al modelo interno. Presentation contiene schemas de formulario, autoría y visualización. `app/di` ensambla las implementaciones y AppProviders inyecta operaciones mediante Context.

Query mantiene datos remotos; las mutaciones invalidan las consultas de assessments. Zustand no almacena tests o respuestas. Los schemas de UI no se reutilizan como reglas de dominio. Las sumas de puntajes de configuración son parte de la autoría; la evaluación de entregas y sus estadísticas solo ocurre en el **servicio simulado**, nunca en componentes React.

El banco, los cursos, equipos y alumnos son fixtures separadas de los componentes. El catálogo provisional sirve a este flujo, sin importar internals de Users, Projects o Metrics. Las reglas arquitectónicas incluyen `assessments` y rechazan dependencias prohibidas/ciclos.

## Contrato provisional de MSW

Todas las rutas son relativas a `VITE_API_BASE_URL`. **No son endpoints backend confirmados.**

| Método | Ruta                              | Responsabilidad                                |
| ------ | --------------------------------- | ---------------------------------------------- |
| GET    | `/demo/assessments`               | Tests y los tres contadores del inicio         |
| GET    | `/demo/assessments/catalog`       | Cursos, equipos, alumnos y preguntas guardadas |
| GET    | `/demo/assessments/:id`           | Detalle, participantes y resultados            |
| POST   | `/demo/assessments`               | Crear borrador                                 |
| POST   | `/demo/assessments/:id/draft`     | Actualizar y guardar como borrador             |
| POST   | `/demo/assessments/:id/publish`   | Validar y publicar/programar                   |
| POST   | `/demo/assessments/:id/reminders` | Registrar recordatorio simulado                |
| POST   | `/demo/assessments/:id/reviews`   | Guardar revisión docente                       |

Los estados y el total confirmado de puntos se devuelven desde MSW. Los límites actuales (duración 1–300 minutos, máximo 100 preguntas, puntaje hasta 100 por pregunta) son provisionales de la demostración y deben acordarse con backend. El promedio se expresa en puntos del test, no en una escala académica impuesta. La distribución y recomendaciones iniciales son ejemplos ilustrativos.

En modo OIDC real se muestra un aviso de integración pendiente y **no se solicitan estas rutas de demo**. No se habilitará esa conexión automáticamente.

## Migración posterior al backend

1. Confirmar qué servicio de los dominios existentes será responsable de tests, destinatarios, banco y entregas; acordar endpoints del gateway y permisos por curso/docente.
2. Definir contratos de preguntas, opciones, fechas, intentos, programación, borradores, publicación atómica/idempotencia y versiones para edición concurrente.
3. Acordar validaciones de puntajes, revisión humana, privacidad de respuestas correctas, estadísticas y notificaciones. El cliente nunca debe decidir la autorización o calificación autoritativa.
4. Adaptar API service, DTOs y mapper. Si publicación y guardado se vuelven una operación atómica en backend, coordinar el caso de uso sin exponer transacciones técnicas al docente.
5. Confirmar cómo consultar/guardar preguntas del banco; en esta versión se copian las preguntas preexistentes y las nuevas preguntas se guardan dentro del test.
6. Retirar el bloqueo de integración real únicamente tras validar contratos, CORS, JWT, roles y acceso por curso. Mantener MSW y las fixtures para desarrollo y pruebas.
7. Validar entrega de recordatorios y programación en servidor. React no ejecuta tareas programadas; MSW solo simula cambios de estado al consultar.

## Verificación

Pruebas de casos de uso con puertos simulados, mapper, Axios/MSW, schemas externos, hooks, invalidación de caché y rutas reales. Los escenarios de UI incluyen borradores, tipos de pregunta, reordenación, selección de equipo, confirmación/publicación, revisión docente, resultados, recordatorio, errores/reintento y denegación a estudiantes/administradores sin rol docente.

Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run format:check`. Las pruebas de UI son de integración en jsdom; la revisión visual a 1440×1024, 1280×800 y móvil, y la integración con Cognito/backend reales requieren sus entornos correspondientes.
