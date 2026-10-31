# Decisiones de arquitectura

## Estudiantes en Users

La sección docente Estudiantes está implementada dentro de Users con `StudentRepository`, casos de uso, DTOs Zod, mapper, API service, repositorio concreto y hooks Query inyectados desde App. Las rutas exigen TEACHER y consumen endpoints provisionales de MSW; los contadores/estados llegan del servicio simulado. Application de Users ya contiene operaciones reales para listado por curso y contribución. Login conserva su flujo actual sin cambios. Contratos y migración futura: [students.md](students.md).

## Regla vigente de integración

Las nuevas features deben conservar el flujo Presentation → hooks Query → Application → puerto de repositorio → Infrastructure → Axios → endpoints simulados por MSW mientras el backend no esté disponible. Las indicaciones genéricas de un prompt de UI sobre “solo estado local” no sustituyen esta decisión acordada para la solución. React conserva estado local de edición e interfaz; las entidades y operaciones del módulo se consumen como contratos de servicio. Los endpoints reales se definirán posteriormente y no se inventarán ni activarán automáticamente.

## Rúbricas

`features/rubrics` implementa biblioteca/autoría docente y consulta estudiantil con puertos, casos de uso, DTOs Zod, mapper, API service, repositorio y DI. Las rutas exigen TEACHER y STUDENT respectivamente. Sus contratos provisionales, decisiones de versionado y migración están en [rubrics.md](rubrics.md). La importación solo envía metadatos a MSW y devuelve una plantilla identificada como simulada; no procesa documentos. La suma de puntos pertenece a la autoría. Los resultados académicos y su trazabilidad proceden del servicio simulado, sin ejecutar reglas de evaluación en React.

## Tests y evaluaciones

La feature `assessments` implementa autoría de tests y revisión docente con las cuatro capas, DI manual, TanStack Query y contratos HTTP provisionales de MSW. Su documentación y migración pendiente están en [assessments.md](assessments.md). Exige rol TEACHER, incluso si el usuario es administrador. No presume un nuevo microservicio del backend. La calificación final y las estadísticas se devuelven desde el servicio simulado; React solo permite configurar preguntas, seleccionar destinatarios y registrar la decisión del docente. No se activarán endpoints reales hasta confirmar el backend.

## Login institucional

El layout de acceso tiene un panel institucional y un formulario responsive. Sus estilos están acotados a `.login-shell` y reutilizan los tokens principales azules del área autenticada. Los componentes y el schema de formulario pertenecen a Users/Presentation; no realizan solicitudes HTTP.

`useLogin` consume el puerto de sesión mediante AuthContext. El correo es una pista opcional (`login_hint`) para el proveedor OIDC. La contraseña y su recuperación se gestionan en el proveedor: el campo local está deshabilitado y explica este comportamiento. No se ha añadido un flujo alternativo de credenciales ni un SDK adicional. El botón SSO inicia el flujo existente sin enviar la pista de correo.

La selección Docente/Estudiante determina el perfil únicamente en demo. En OIDC no se transmite como privilegio: los roles siguen procediendo de los grupos del usuario autenticado. El acceso demo sin opciones sigue siendo docente, manteniendo compatibilidad con las llamadas existentes.

“Recordar mi perfil” guarda solo `teacher` o `student` en localStorage, si se marca. Nunca guarda correo, contraseña o tokens. El destino interno solicitado, con query y fragmento, se conserva temporalmente en sessionStorage para sobrevivir al redirect y se limpia al autenticarse. Se rechazan destinos externos y bucles hacia login. La ausencia de almacenamiento no impide iniciar sesión.

Hay pruebas de integración para login docente/estudiante, autorización, Projects, detalle, logout, hint de correo, SSO, errores, envíos duplicados, preferencias y retorno a rutas protegidas. La autenticación con un tenant Cognito real requiere su configuración.

## Alcance progresivo

El resumen docente está implementado en Metrics, con el estado y contrato provisional documentados en [teacher-dashboard-plan.md](teacher-dashboard-plan.md). `TeacherOverviewRepository` es el puerto, `GetTeacherOverviewUseCase` la operación y `MetricsApiService` el adaptador HTTP; App compone e inyecta la operación mediante Context. Query separa caché por curso y periodo. La paleta del área autenticada sigue la referencia: sidebar azul marino, acciones azules, superficies blancas y fondo gris azulado. Los estados mantienen verde/ámbar/rojo según su significado.

Por ahora los datos son simulados mediante MSW. La futura pantalla docente deberá conservar esa frontera HTTP y mantener fixtures fuera de componentes. La integración con servicios reales se hará cuando el backend esté terminado y se hayan confirmado sus contratos, adaptando services/DTOs/mappers y configuración, sin sustituir el flujo de capas ni eliminar las pruebas con mocks. No se implementarán evaluaciones académicas en React.

Projects y el resumen docente de Metrics implementan las cuatro capas. Users contiene identidad, adaptadores OIDC/demo y páginas de sesión/perfil. CI/CD, las métricas específicas de proyecto, AI Practice y Notifications conservan presentación inicial y contratos pendientes documentados. No se generan clases simétricas ni endpoints reales especulativos.

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

Los futuros API services serán user-api.service.ts, pipeline-api.service.ts, ai-practice-api.service.ts y notification-api.service.ts. Recibirán HttpClient por inyección. Projects y Metrics ya tienen API services con contratos provisionales usados por MSW; ninguno representa un contrato backend confirmado.

## Verificación

TypeScript, ESLint y dependency-cruiser validan código y dependencias; Vitest + MSW comprueban el flujo sin Spring Boot. No sustituyen autorización del backend, navegador real, tenant Cognito ni confirmación de contratos. El build compila; el arranque valida entorno con Zod.
