# Estudiantes: seguimiento docente

## Estado y navegación

La sección está implementada en `features/users`: es una consulta de estudiantes por curso y su contribución, sin introducir un nuevo microservicio ni mezclar entidades en shared. La sidebar docente abre `/teacher/students`; el detalle usa `/teacher/students/:studentId?course=<id>`. Exige rol TEACHER, no está en la navegación estudiantil y un administrador sin rol docente tampoco tiene acceso.

El dashboard conserva su botón de muestra de estudiantes y su diálogo. El enlace principal de la sidebar ahora abre la sección completa.

## Arquitectura y datos

```text
StudentsPage / StudentContributionPage
  → useStudents / useStudentContribution (TanStack Query)
  → GetCourseStudentsUseCase / GetStudentContributionUseCase
  → StudentRepository (puerto de Domain)
  ← StudentRepositoryImpl → StudentApiService → Axios → MSW
```

`app/di/container.ts` construye la implementación y los casos de uso; AppProviders expone las operaciones mediante StudentContext. Application ya contiene código en uso para estas operaciones; no existe únicamente como carpeta documental. Los DTOs se validan con Zod y el mapper convierte campos externos como `project_id`, `student_count` y `updated_at`.

Todos los datos proceden del servicio simulado. La participación, los estados y los tres indicadores del curso llegan en la respuesta: React no aplica umbrales, no infiere desempeño y no calcula calificaciones. Los colores se eligen según el estado recibido. “Requiere acompañamiento” es una orientación para revisión humana, no una conclusión académica.

Las fixtures tienen tres cursos con 5, 4 y 3 estudiantes; la identidad de los IDs compartidos coincide con el catálogo de Tests y evaluaciones. Los proyectos usan IDs existentes para que los enlaces de detalle funcionen. Cada curso es una muestra independiente y los datos no representan actividad real de GitHub ni notificaciones en tiempo real.

## Interacciones

- Selección de curso mediante opciones accesibles con teclado. Las Query Keys incluyen curso para separar caché.
- Búsqueda por nombre, correo, equipo y proyecto sobre la lista recibida. El filtro y curso se guardan en la URL; volver del detalle conserva ambos.
- Indicadores del curso completo y contador separado de filas visibles. Cambiar curso limpia la búsqueda para no ocultar resultados por un filtro anterior.
- Enlaces al perfil de contribución y al proyecto. El detalle incluye periodo, equipo, participación, commits, cambios revisados, evidencias y orientación docente.
- CSV real con las filas filtradas, curso/sección/ciclo y etiqueta de datos simulados. Las celdas de texto se protegen frente a fórmulas de hoja de cálculo. No se exporta una calificación inexistente.
- Estados loading, vacío, sin coincidencias y error con reintento. El botón Actualizar confirma datos de demostración únicamente tras una consulta exitosa.
- Vista responsive: tabla en escritorio y filas en tarjetas en móvil, con labels, foco y estados escritos además de colores.

## Endpoints provisionales

| Método | Ruta relativa al gateway                | Respuesta                                                                    |
| ------ | --------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/demo/students?course=<id>`            | Curso seleccionado, opciones de curso, estudiantes, resumen y fecha de datos |
| GET    | `/demo/students/:studentId?course=<id>` | Contribución del estudiante en ese curso, evidencias y orientación           |

Son contratos exclusivos de MSW y no endpoints backend confirmados. Los cursos de ejemplo son `software`, `quality` e `integrator`; el inicial es `software`. El mock rechaza cursos inexistentes y estudiantes que no pertenecen al curso consultado. Los ejemplos tienen fecha fija para mostrar claramente qué periodo se está consultando, en zona horaria America/Lima.

En autenticación real OIDC se muestra un aviso de integración pendiente y no se solicitan rutas de demo. La futura autorización por rol, curso y estudiante deberá aplicarse también en el backend; los guards de UI no la sustituyen.

## Integración posterior con backend

1. Acordar servicio propietario de catálogo/membresías y fuente de contribuciones, rutas del API Gateway, DTOs, filtros y paginación.
2. Confirmar identidad estable de estudiantes/cursos/equipos/proyectos entre Users, Projects, CI/CD y Metrics. Sustituir el curso inicial de muestra por la selección/default autorizado devuelto por el backend.
3. Definir periodo, significado y procedencia de participación, estados, cambios revisados y recomendaciones. Los indicadores deben llegar calculados por los servicios responsables, sin trasladar reglas académicas a React.
4. Adaptar API service, schemas externos y mappers; conservar los puertos/casos de uso y las pantallas cuando el contrato lo permita.
5. Acordar búsquedas y exportación de listas completas si hay paginación. Hoy la exportación incluye todas las filas visibles de la muestra descargada, no un padrón real.
6. Validar JWT, pertenencia al curso y 401/403/404. Desactivar mocks y retirar el bloqueo de integración real solo después de confirmar esos contratos. Mantener MSW para desarrollo y pruebas.

## Verificación

Las pruebas cubren casos de uso con puertos simulados, DTO/mapping vía Axios y MSW, pertenencia a curso, errores externos, Query cache por curso, búsqueda con foco estable, retorno desde detalle, enlaces a Projects, lista vacía, reintento, CSV y permisos por rol. Se mantiene la regresión del dashboard y sus diálogos existentes.

Ejecutar typecheck, lint/arquitectura, test, build y format:check. Las pruebas de UI usan jsdom; la revisión visual en navegador y las pruebas con el backend real siguen pendientes de sus entornos.
