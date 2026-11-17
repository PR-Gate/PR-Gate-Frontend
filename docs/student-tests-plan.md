# Plan de Mis tests

## Alcance

Pantalla del estudiante para consultar tests personalizados que la IA propone a partir de fallos detectados en su código, completar el refuerzo y revisar resultados y explicaciones. La referencia guía la composición visual; sus nombres, números, fechas y notas no se copiarán como datos.

Estado: pantalla inicial implementada en `/practice`, con acceso STUDENT, navegación «Mis tests», indicadores pendientes y secciones responsive. Sin mocks, llamadas a IA desde el navegador ni endpoints inventados. Build, lint y reglas de arquitectura aprobados. Revisión visual en navegador pendiente. Resolver preguntas, enviar intentos y consultar resultados reales serán una segunda etapa.

## Navegación y arquitectura

Reutilizar `/practice`, actualmente un placeholder de AI Practice, y cambiar su etiqueta en el menú del estudiante a «Mis tests». Conservar `/feedback` como sección distinta. La pantalla estará restringida a STUDENT; no cambiará las evaluaciones del docente ni su previsualización.

Usar `features/ai-practice` para esta experiencia de refuerzo personalizado. El módulo Assessments actual contiene datos docentes, participantes y respuestas correctas; no reutilizar ese DTO para entregar preguntas al alumno. Si el backend comparte el motor de evaluaciones, integrar mediante contratos públicos de las features.

```text
features/ai-practice/
  domain/entities/student-tests.entity.ts
  presentation/
    pages/student-tests.page.tsx
    components/
      student-test-summary.tsx
      pending-student-tests.tsx
      completed-student-tests.tsx
      student-test-guidance.tsx
    styles/student-tests.css
  index.ts
```

Definir un modelo de presentación tipado, independiente del contrato de red futuro. La página comienza con estado explícito `integration-pending`; no crear repositorios que devuelvan listas vacías como si la consulta hubiera tenido éxito, ni hooks de consulta sin servicio real.

## Composición según la referencia

| Bloque | Contenido | Primera entrega |
| --- | --- | --- |
| Cabecera | «REFUERZO PERSONALIZADO», título «Mis tests» y explicación del propósito | «Refuerza lo que necesitas mejorar en tu código con tests personalizados» |
| Tres indicadores | Tests pendientes, tests completados y promedio | `—` con texto de información pendiente; no asumir escala de 20 |
| Pendientes | Tarjetas con título, curso, motivo del refuerzo, estado, fecha límite, duración, preguntas y acción | Encabezado y estado «Tus tests personalizados aparecerán aquí»; sin tarjetas ficticias |
| Completados | Título, fecha de envío, resultado, revisión y acceso a retroalimentación | «Aquí podrás revisar tus resultados y lo que aprendiste»; sin notas ni filas inventadas |
| Antes de comenzar | Orientaciones sobre instrucciones, duración y conexión | Texto neutral: revisar instrucciones antes de iniciar; no afirmar que un test no se puede pausar sin contrato confirmado |
| Disponibilidad | Aviso discreto del estado de la información | «Tus tests estarán disponibles cuando se conecte la información de tus evaluaciones» |

Conservar tarjetas blancas, fondo claro, azul de marca y colores semánticos con texto e iconos. En escritorio, indicadores en tres columnas y listados a lo ancho; en móvil, una columna y metadatos apilados. Reutilizar el layout autenticado sin copiar los controles de búsqueda, GitHub o curso de la captura: su funcionalidad no forma parte de esta entrega.

El motivo de cada test debe conectar el fallo con el aprendizaje: proyecto o evaluación de origen, tema a reforzar y objetivo pedagógico, únicamente cuando existan datos reales. El backend decide qué actividad corresponde; el frontend no deduce recomendaciones a partir de métricas.

## Estados e interacciones

- Integración pendiente: valores `—`, estructura visible y mensajes explicativos; sin skeleton permanente ni reintentos ficticios.
- Cargando: al activar la consulta real, skeleton temporal y aviso accesible.
- Vacío confirmado: una respuesta real sin tests; diferenciar «Sin tests pendientes» de ausencia de información. Mostrar cero solo si está confirmado.
- Datos disponibles: secciones independientes; una nota pendiente de revisión no equivale a cero ni a desaprobación. Calificación y escala provienen del backend.
- Error: aviso y reintento de consulta real; no presentar un error como listado vacío.

«Comenzar test», «Continuar» y «Ver resultado» solo se habilitan cuando existan registros, permisos, estado y destinos funcionales. En la primera entrega no habrá enlaces rotos ni botones que simulen éxito. No generar toasts de sincronización ni fecha de actualización ficticia.

## Contrato por confirmar con backend

1. Consulta de tests del estudiante autenticado, alcance por curso, filtros, paginación y totales globales frente a totales de página.
2. Vínculo con el proyecto, commit, pipeline, hallazgo o evaluación que originó el refuerzo; visibilidad de la explicación pedagógica.
3. Estados y transiciones: generación, disponible, en curso, enviado, en revisión, calificado y vencido; cuáles cuentan como pendientes o completados.
4. Curso y sección, fecha límite, zona horaria, duración, cantidad de preguntas, escala y cálculo del promedio. No promediar localmente páginas incompletas.
5. Tipos de pregunta, política de intentos, pausa, recuperación, guardado, envío, temporizador y vencimiento. El servidor debe validar tiempo, autoría y permisos.
6. Entrega de retroalimentación, respuestas correctas y revisión docente. El contrato de preguntas del alumno no debe incluir soluciones antes del momento autorizado.
7. Generación de tests: automática o solicitada, validación docente si aplica, latencia y errores. No añadir un botón de generación sin confirmar ese flujo.
8. Rutas y DTOs, nulos, errores y datos necesarios para acceder al intento y al resultado.

Con el contrato definido, añadir hook React Query → caso de uso → puerto → repositorio → API service con Zod y mapper, usando el cliente HTTP y el contenedor existentes. Incluir identidad y filtros en las claves de caché y respetar las APIs públicas entre features. La IA y las credenciales permanecen en backend.

## Orden de trabajo y aceptación

1. Crear modelo de presentación y componentes con estado de integración pendiente.
2. Construir pantalla responsive y actualizar navegación/ruta de estudiante.
3. Revisar semántica, teclado, foco visible, contraste y explicación de acciones no disponibles.
4. Probar acceso por rol, ausencia de datos ficticios, valores pendientes y conservación de las rutas docentes; sin fixtures ni handlers del nuevo resumen de tests.
5. Ejecutar typecheck/build, lint y reglas de arquitectura; revisar visualmente escritorio y móvil e informar cualquier bloqueo de verificación.

La primera entrega se acepta cuando el estudiante puede abrir «Mis tests» y comprender dónde encontrará actividades y resultados, sin información inventada. La resolución de tests y la integración real se implementarán después de confirmar los contratos.
