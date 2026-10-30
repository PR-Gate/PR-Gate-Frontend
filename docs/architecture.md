# Decisiones de arquitectura

## Alcance progresivo

Projects implementa las cuatro capas. Users contiene identidad, adaptadores OIDC/demo y páginas de sesión/perfil. CI/CD, Metrics, AI Practice y Notifications tienen presentación inicial y contratos pendientes documentados. No se generan clases simétricas ni endpoints especulativos.

## Composición y fronteras

Los repositorios pertenecen al dominio; los casos de uso desconocen implementaciones. App ensambla adaptadores y los hooks reciben operaciones desde Context. HttpClient abstrae transporte técnico; ProjectRepository abstrae acceso al dominio. No duplican responsabilidades.

Los API services validan unknown con Zod; mappers convierten DTOs. Los schemas de formulario son independientes. La regla de enlace HTTPS solo protege navegación. La SPA no calcula rúbricas, Quality Gates ni calificaciones.

## Estado y sesión

Query mantiene caché de servidor y cancelación. Context mantiene identidad y el proveedor OIDC mantiene tokens en memoria. Zustand controla sidebar. Logout y eventos de sesión limpian caché. No hay repositorios globales ni secretos del cliente.

## Contratos pendientes

| Contexto      | Acuerdos necesarios antes de implementar HTTP                                                      |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Users         | Perfil autoritativo, listado/paginación, permisos y edición. Ya tiene adaptador OIDC configurable. |
| CI/CD         | IDs de ejecución, estados, logs, evidencias y formato de Quality Gates.                            |
| Metrics       | Unidades, ventanas temporales y granularidad proyecto/estudiante.                                  |
| AI Practice   | Feedback, ejercicios, recomendaciones y progreso; LLM exclusivamente en backend.                   |
| Notifications | Paginación, lectura, idempotencia y actualización.                                                 |

Los futuros API services serán user-api.service.ts, pipeline-api.service.ts, metrics-api.service.ts, ai-practice-api.service.ts y notification-api.service.ts. Recibirán HttpClient por inyección. El único contrato REST provisional implementado es Projects, usado por MSW.

## Verificación

TypeScript, ESLint y dependency-cruiser validan código y dependencias; Vitest + MSW comprueban el flujo sin Spring Boot. No sustituyen autorización del backend, navegador real, tenant Cognito ni confirmación de contratos. El build compila; el arranque valida entorno con Zod.
