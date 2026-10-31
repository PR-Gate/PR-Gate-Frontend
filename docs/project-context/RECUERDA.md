# Contexto y acuerdos del proyecto

Este documento reúne las decisiones que deben conservarse al implementar nuevas secciones de **Orquestador Académico / PR Gate**. Los prompts de diseño pueden no conocer este contexto: sus propuestas visuales deben adaptarse a la solución existente.

Si una instrucción posterior cambia explícitamente un acuerdo, actualizar este documento para mantener una referencia vigente.

## 1. Contexto de la solución

La plataforma acompaña proyectos universitarios de desarrollo de software mediante evidencia técnica, pipelines CI/CD, Quality Gates, rúbricas, evaluación académica y retroalimentación pedagógica.

Existen experiencias diferenciadas para docentes y estudiantes. El backend previsto utiliza Java/Spring Boot, microservicios y APIs REST mediante un API Gateway. Sus seis dominios son Users, Projects, CI/CD, Metrics, AI Practice y Notifications. Una nueva feature frontend no implica crear un nuevo microservicio.

## 2. El backend todavía no está integrado

**Por ahora usamos datos mockeados, pero el frontend debe construirse para consumir APIs y endpoints.**

Flujo que deben seguir las operaciones de negocio:

```text
Página / componente
  → hook con TanStack Query
  → caso de uso en Application
  → contrato de repositorio en Domain
  ← implementación del repositorio en Infrastructure
  → API service
  → HttpClient / Axios
  → endpoint simulado por MSW
```

Cuando esté disponible el backend, la última frontera será API Gateway → microservicio real. Se confirmarán endpoints, DTOs, permisos y formatos; se adaptarán los servicios y mappers conservando las pantallas y los casos de uso cuando el contrato funcional lo permita.

- No sustituir este flujo por listas de negocio mantenidas únicamente con `useState`, aunque un prompt genérico sugiera “sin API” o “solo estado local”.
- Mantener fixtures y handlers de MSW fuera de componentes, en `src/testing/mocks`.
- Identificar los datos, publicaciones, recordatorios, evidencias y cargas simuladas como demostraciones. No afirmar que hubo sincronización, envío de correo o conexión real si no ocurrió.
- Las rutas `/demo/...` son contratos provisionales, no endpoints backend confirmados.
- No inventar URLs reales, credenciales, identificadores de Cognito ni integraciones externas.
- No activar automáticamente los servicios reales. Las secciones que aún tienen un bloqueo de integración real deben conservarlo hasta confirmar el contrato correspondiente.
- Conservar MSW para desarrollo y pruebas después de integrar el backend.

## 3. Arquitectura que se debe respetar

**Feature-Based + capas inspiradas en DDD + Arquitectura Hexagonal**, con composición manual de dependencias.

| Ubicación                           | Responsabilidad                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `features/<feature>/domain`         | Modelos del contexto, tipos y contratos de repositorio. Sin React, Axios ni capas externas.     |
| `features/<feature>/application`    | Casos de uso que reciben puertos internos. Sin HTTP ni implementaciones concretas.              |
| `features/<feature>/infrastructure` | API services, DTOs externos, validación Zod, mappers y adaptadores de repositorio.              |
| `features/<feature>/presentation`   | Páginas, componentes, hooks Query, formularios, schemas de UI y estado temporal de edición.     |
| `app/di`                            | Construcción e inyección de implementaciones concretas.                                         |
| `app`                               | Configuración, providers, layouts, rutas y guards.                                              |
| `shared`                            | UI e infraestructura técnica reutilizable; no entidades de negocio ni dependencias de features. |

`application` **no existe por la ausencia del backend**. Sus casos de uso permanecen con un backend real; solo cambian si cambia la operación que necesita la aplicación. No crear carpetas con solo un README ni abstracciones vacías para completar un árbol.

Los componentes no llaman a Axios ni importan Infrastructure. Los DTOs HTTP no llegan directamente a la UI. Las dependencias entre features pasan por sus APIs públicas; App puede acceder a internals para ensamblar dependencias y rutas. Mantener los controles de dependency-cruiser y evitar ciclos.

## 4. Responsabilidades del frontend y del backend

El frontend presenta datos, recoge formularios, permite configurar pruebas/rúbricas y registra decisiones del docente.

El backend es responsable de ejecutar pipelines, procesar webhooks, aplicar reglas deterministas, evaluar Quality Gates, producir resultados académicos autoritativos e integrar modelos de IA.

- React no debe convertir métricas técnicas en una calificación ni decidir el desempeño de un estudiante.
- Los puntajes, porcentajes, estados, reglas aplicadas, evidencias y recomendaciones de resultados llegan del servicio; hoy los entrega el mock.
- Sumar puntos al **configurar** preguntas o criterios es autoría, no evaluación de entregas. Se permite validar esa configuración en la UI; el backend deberá validarla también.
- Las condiciones textuales de niveles de una rúbrica no se ejecutan como reglas en React.
- La participación y los commits son señales orientativas. Mostrar evidencia y lenguaje de acompañamiento; no presentar conclusiones académicas definitivas.
- La decisión académica final permanece bajo control docente. No atribuirla a la IA.

## 5. Estado, permisos y sesión

- TanStack Query gestiona consultas, mutaciones, caché e invalidación. Incluir curso, estudiante o filtros relevantes en las Query Keys.
- React gestiona estado de edición, filtros, selección de archivos, criterios/niveles sin guardar y modales.
- Zustand se reserva para estado de interfaz compartido, como la sidebar. No duplicar allí datos del servidor.
- Context se utiliza para composición, sesión e inyección de operaciones.
- No guardar rúbricas, tests, respuestas, documentos o tokens sensibles en localStorage. La preferencia de perfil del login es una excepción existente de UI, no una sesión persistida.
- Mantener separados los accesos docente y estudiante mediante navegación y guards. Las secciones docentes implementadas de Tests, Rúbricas y Estudiantes exigen `TEACHER`, incluso para un administrador sin ese rol.
- “Mi rúbrica” es una consulta de solo lectura para `STUDENT`. Las versiones y resultados ya asignados no cambian al editar una rúbrica publicada.
- Una previsualización estudiantil no cambia los permisos reales de la cuenta.
- Conservar login demo, OIDC/PKCE, cierre de sesión, recuperación y rutas protegidas. El backend deberá validar las autorizaciones reales por rol y pertenencia al curso.

## 6. Diseño y experiencia

Reutilizar componentes, estilos y tokens existentes: azul institucional para acciones, azul marino para navegación, superficies blancas y fondo gris azulado. Verde, ámbar y rojo expresan estados y siempre se acompañan de texto o iconos.

Mantener formularios claros, labels visibles, foco, navegación con teclado, estados loading/error/empty/success y diseño responsive. Confirmar acciones destructivas y publicación; avisar antes de descartar cambios sin guardar.

Las cargas de documentos actuales son simuladas: solo se envían metadatos y se muestran plantillas de ejemplo para revisión. No leer ni extraer contenido real hasta implementar y acordar el servicio de importación.

No agregar botones que aparenten funcionar sin hacerlo. Una acción debe tener un comportamiento verificable o explicar que está pendiente de integración.

## 7. No romper lo que ya funciona

Antes de modificar una sección, inspeccionar el código y reutilizar lo existente. Acotar los cambios, conservar el trabajo previo y no reescribir funcionalidades ajenas al pedido.

Verificar según el alcance:

```text
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Agregar pruebas de comportamiento cuando correspondan y mantener las regresiones de login, permisos, dashboard, Projects, Tests, Rúbricas y Estudiantes. No eliminar comprobaciones para ocultar fallos ni reportar resultados que no se ejecutaron.

Una respuesta HTTP 200 o una prueba en jsdom no sustituyen la revisión visual en navegador. Distinguir siempre lo verificado de lo pendiente. Un cambio solo documental no necesita ejecutar toda la suite de la aplicación.

## 8. Referencias de implementación

- [README principal](../../README.md): ejecución y configuración.
- [Arquitectura](../architecture.md): decisiones y límites.
- [Resumen docente](../teacher-dashboard-plan.md): dashboard y contratos provisionales.
- [Tests y evaluaciones](../assessments.md): autoría, publicación y revisión.
- [Rúbricas](../rubrics.md): versiones, importación y consulta estudiantil.
- [Estudiantes](../students.md): listado por curso, contribución y exportación.
- [Inventario de archivos](../file-tree.txt).
