# Plan del resumen docente

## Alcance y estado

La referencia presenta el resumen de un curso: navegación docente, KPIs, distribución de proyectos, actividad reciente y proyectos que requieren atención. La pantalla está implementada en `/teacher/dashboard` con MSW, filtros, widgets, CSV, previsualización estudiantil y muestra de estudiantes. La sidebar admite colapso en escritorio y navegación móvil. “Mis cursos” lleva al selector; “Estudiantes” abre la sección completa `/teacher/students`. El botón “Ver muestra de estudiantes” del dashboard conserva su diálogo. Rúbricas y Tests y evaluaciones ya tienen módulos funcionales con MSW; Learning Analytics conserva su página inicial pendiente.

Las fases 1–4 están implementadas con las limitaciones explícitas de demo. La fase 5 sigue pendiente de backend. Hay pruebas automatizadas de la fase 6; la revisión visual en navegador y las pruebas contra Cognito/backend reales siguen pendientes.

**Decisión vigente: los datos son mockeados.** Se trabajará con fixtures y MSW hasta que el backend esté terminado y sus contratos estén confirmados. No se conectarán servicios reales ni se reemplazará MSW por datos incrustados en componentes. El indicador de demostración debe permanecer visible.

## Contrato provisional implementado

`GET /demo/teacher-overview?course=<id>&period=<7|30>`, relativo a la base del gateway configurada, es exclusivamente un contrato de MSW. El curso omitido selecciona `software`. Las otras fixtures son `architecture` y `web`; esta última cubre el caso vacío. Las respuestas incluyen cursos, KPIs, distribución, actividad, proyectos de atención y una muestra parcial de estudiantes. Fechas de ejemplo: 30 de octubre de 2026, formateadas en Lima. Cambiar periodo modifica los datos simulados de evaluaciones y ahorro; no inventa una fórmula en la UI.

Los nombres externos y fechas se validan en `teacher-overview-response.dto.ts` y se transforman en el mapper. Las calificaciones están en escala de demostración 0–20, pendiente de confirmar con backend. El API service concentra la ruta provisional para facilitar su sustitución. En modo de autenticación real, el router muestra un aviso de integración pendiente y no solicita esta ruta de demo.

Para explorar: `npm run dev`, entrar como Docente y seleccionar “Resumen”. El login sigue llevando a Projects por compatibilidad. Se puede cambiar curso/periodo, filtrar la tabla por proyecto/equipo, abrir detalles, expandir actividad, consultar estudiantes, descargar un CSV real y actualizar los datos con un toast solo tras éxito. GitHub está deshabilitado con explicación. La previsualización no cambia permisos ni representa un estudiante concreto.

El CSV identifica los datos simulados, incluye los indicadores y la tabla filtrada, y protege las celdas de texto frente a fórmulas de hojas de cálculo. Las fixtures de atención usan IDs existentes de Projects. La muestra de estudiantes no pretende ser el padrón completo. No se anuncian eventos como tiempo real.

## Paleta de referencia

Valores aproximados a partir de la imagen; centralizados en `shared/styles/globals.css`.

| Elemento                        | Color / token                                      |
| ------------------------------- | -------------------------------------------------- |
| Sidebar y franja de indicadores | `#101B31` / sidebar                                |
| Botones, enlaces y foco         | `#265DCE` / primary                                |
| Opción activa de navegación     | `#244B84` / sidebar-accent                         |
| Acentos sobre fondo oscuro      | `#B9CFFF` / sidebar-highlight                      |
| Fondos azules suaves            | `#EAF0FF` / primary-soft                           |
| Fondo de pantalla               | `#F5F7FB` / background                             |
| Tarjetas y cabecera             | Blanco                                             |
| Texto principal                 | `#18243B` / foreground                             |
| Texto secundario                | `#68778F` / muted-foreground                       |
| Bordes                          | `#E5EAF3` / border                                 |
| Éxito, pendiente, fallo         | Verde, ámbar y rojo, acompañados de texto e iconos |

El verde representa éxito, no la identidad principal. El login y el área autenticada comparten ahora los tokens principales. Las sombras serán discretas, las tarjetas tendrán bordes suaves y el contraste se revisará en navegador.

## Fase 1: navegación y estructura

- Montar la pantalla en `/teacher/dashboard`, conservando RoleGuard para TEACHER/ADMIN. Mantener `/dashboard` para acceso general y las rutas actuales de Projects.
- Adaptar la sidebar docente a Resumen, Mis cursos, Proyectos, Estudiantes, Rúbricas, Learning Analytics, Notificaciones y Configuración. Añadir nuevas rutas solo cuando exista una pantalla funcional; no crear enlaces rotos.
- Añadir la selección de curso/sección y conservar el perfil autenticado. Los cursos y sus permisos serán datos simulados en esta etapa.
- Preparar cabecera con búsqueda y acciones. Conectar GitHub necesita una integración futura: no inventar credenciales, OAuth ni conexiones exitosas. La vista estudiante será una previsualización explícita; no cambiará los roles reales de la sesión.
- Mantener logout, navegación móvil y manejo de sesión funcionando. Añadir colapso de sidebar como estado de UI, sin almacenar datos remotos en Zustand.

## Fase 2: datos simulados a través de puertos

Usar el contexto Metrics para el modelo de lectura del resumen académico. El dashboard es una vista de composición, no un nuevo bounded context del backend.

Estructura propuesta, a crear cuando se implementen los widgets:

```text
features/metrics/
  domain/
    entities/teacher-overview.entity.ts
    repositories/teacher-overview.repository.ts
  application/use-cases/get-teacher-overview.use-case.ts
  infrastructure/
    dto/teacher-overview-response.dto.ts
    mappers/teacher-overview.mapper.ts
    services/metrics-api.service.ts
    repositories/teacher-overview.repository.impl.ts
  presentation/
    hooks/use-teacher-overview.ts
    components/
      teacher-summary-cards.tsx
      teacher-progress-strip.tsx
      project-status-chart.tsx
      recent-activity-list.tsx
      projects-attention-table.tsx
    pages/teacher-dashboard.page.tsx
  index.ts
testing/mocks/
  teacher-overview.fixtures.ts
  teacher-overview.handlers.ts
```

Flujo: página → hook Query → caso de uso → puerto de repositorio → implementación → API service → Axios → MSW. Las rutas y DTOs de la demostración se documentarán como provisionales, nunca como contrato confirmado del backend.

El resumen incluirá curso/sección, KPIs, distribución de estados, actividad y referencias a proyectos existentes en las fixtures de Projects. Los IDs deberán coincidir para que los enlaces de detalle funcionen. Las fechas de fixtures y el reloj de pruebas serán controlados; la fecha visible usará `America/Lima`.

Las Query Keys incluirán curso y periodo. El servidor simulado devolverá conteos, porcentajes, calificaciones, severidad y tiempo estimado ahorrado. El frontend solo dará formato y dibujará las series: no calculará calificaciones ni evaluará reglas de Quality Gates.

## Fase 3: widgets de la pantalla

1. **Encabezado:** fecha local, saludo obtenido de la sesión, curso activo y acceso a proyectos.
2. **Cuatro tarjetas:** cursos activos, proyectos evaluados, evaluaciones pendientes y alertas críticas. Los números de la imagen son referencia visual; los valores procederán de fixtures coherentes.
3. **Franja oscura:** tiempo estimado ahorrado y estudiantes activos, con descripción accesible de la barra. No inventar una fórmula de ahorro.
4. **Estado de proyectos:** donut con total y leyenda Aprobado, En revisión, Requiere corrección y Fallido. Usar SVG nativo para esta visualización simple y una alternativa textual accesible, sin añadir una biblioteca de gráficos innecesaria.
5. **Actividad reciente:** eventos simulados de pipeline, Quality Gate, push y evaluación. No anunciar actualizaciones en tiempo real mientras no exista ese servicio.
6. **Tabla de atención:** proyecto/equipo, repositorio, último commit, pipeline, Quality Gate, calificación y acceso a detalle. Mostrar las notas devueltas por el servicio simulado, sin derivarlas de las métricas.

## Fase 4: interacciones y estados

- Cambiar curso/periodo actualizará consultas y widgets; filtros compartidos no duplicarán el modelo remoto en un store.
- “Revisar proyectos” y cada fila abrirán rutas existentes. Las acciones futuras de evaluación dependerán de contratos y permisos definidos.
- La búsqueda actuará sobre los datos disponibles y distinguirá lista vacía de ausencia de coincidencias.
- Si se habilita exportación, generará un archivo real con los datos visibles y una indicación de que son simulados. No mostrar un botón que solo lance un toast.
- Mostrar skeletons, error con reintento y empty states. Ofrecer fixtures/handlers para éxito, vacío, fallo y respuesta lenta.
- Mostrar “Datos de demostración actualizados” únicamente tras una consulta exitosa. Evitar el mensaje “Datos sincronizados” si sugiere conexión con un backend real.
- Mantener badges e indicadores con texto e iconos, navegación por teclado, encabezados de tabla y foco visible. En móvil, apilar widgets y permitir scroll horizontal de la tabla.

## Fase 5: integración futura con backend

Esta fase queda pendiente hasta que el backend esté terminado y sus contratos se hayan confirmado:

1. Acordar endpoints del gateway, DTOs, paginación, filtros de curso/periodo, estados, unidades, permisos y modelo de errores.
2. Confirmar si habrá un endpoint agregado para el resumen. Si no existe, componer consultas mediante las APIs públicas de las features, sin importar internals de Projects, CI/CD o Notifications desde Metrics.
3. Adaptar API service, schemas Zod y mappers al contrato real. Preservar el modelo usado por los widgets siempre que sea posible.
4. Configurar gateway y OIDC con valores reales, desactivar MSW mediante las variables existentes y comprobar CORS, 401/403 y acceso por curso.
5. Mantener las fixtures para desarrollo y pruebas. No borrar los mocks al conectar el backend.
6. Implementar GitHub, actualización periódica o eventos en tiempo real solo cuando existan contratos autorizados para esas integraciones.

No hay fecha supuesta de disponibilidad del backend y no se activará su conexión automáticamente.

## Fase 6: validación y aceptación

- Pruebas de mapper, caso de uso con repositorio simulado, adaptador/MSW, hook y página.
- Verificar cambio de curso, enlaces de proyectos, permisos docentes, estados vacío/error/loading y exportación si se implementa.
- Conservar la regresión de login docente/estudiante, OIDC, logout, guardas y Projects.
- Ejecutar typecheck, lint/arquitectura, pruebas, build y comprobación de formato.
- Comparar con la referencia en escritorio, tablet y móvil. Una revisión HTTP no sustituye la revisión visual.

Se considerará terminada la pantalla cuando sus widgets lean datos a través del flujo con MSW, todas las acciones visibles tengan un comportamiento real o expliquen su indisponibilidad, las pruebas pasen y la navegación existente siga funcionando.
