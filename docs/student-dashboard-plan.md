# Plan de la vista resumen del estudiante

## Objetivo y alcance

Reemplazar la bienvenida genérica de `/dashboard` para el rol `STUDENT` por el resumen de la referencia. Esta primera entrega será una pantalla preparada para integrar el backend, sin datos simulados, fixtures, handlers MSW ni endpoints supuestos.

**Estado:** primera entrega implementada con saludo de sesión, indicadores pendientes, paneles responsive y acciones futuras deshabilitadas con explicación. Se conserva la precedencia de TEACHER/ADMIN para cuentas con varios roles. No se añadieron consultas ni mocks del resumen. La revisión visual en navegador queda pendiente porque Computer Use no recibió autorización para acceder a Chrome; la integración real continúa como segunda etapa.

Conservar el layout autenticado, la navegación móvil, la sidebar colapsable y los tokens visuales existentes. El resumen docente y su previsualización de estudiante quedan fuera de este cambio. Mantener el comportamiento actual de `/dashboard` para los demás roles.

## Composición visual

| Bloque                          | Contenido previsto                                                                                                       | Presentación inicial sin backend                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Encabezado                      | Fecha actual en `America/Lima`, saludo con el primer nombre de la sesión y «Tu progreso técnico, explicado con claridad» | Usar fecha y sesión reales; si falta el nombre, mostrar «Hola»                                              |
| Última ejecución                | Acceso al pipeline más reciente                                                                                          | Botón deshabilitado y explicación visible «Sin ejecución disponible»                                        |
| Mis proyectos                   | Total, activos y finalizados                                                                                             | Valor `—` y «Información pendiente»                                                                         |
| Pipelines recientes             | Total y ejecuciones exitosas en un periodo definido                                                                      | Valor `—`; no asumir periodo ni mostrar conteos                                                             |
| Quality Gates                   | Aprobados sobre total y correcciones pendientes                                                                          | Valor `—`; no inferir estados                                                                               |
| Calificación actual             | Nota y escala                                                                                                            | Valor `—`; escala pendiente de confirmar, sin fijar 20 puntos por la imagen                                 |
| Estado general de mis proyectos | Proyecto, curso, estado, nota y acceso a detalle                                                                         | Conservar encabezado y mostrar «La información de tus proyectos estará disponible aquí» sin filas ficticias |
| Última evaluación               | Proyecto, pipeline, estado de revisión, nota, cobertura, deuda técnica y vulnerabilidades                                | Mostrar estructura con `—` y «Sin evaluación disponible»; acción «Entender mi resultado» deshabilitada      |
| Siguiente paso recomendado      | Recomendación y acceso a orientación                                                                                     | «Las recomendaciones estarán disponibles cuando tengas una evaluación»; acción deshabilitada                |

En escritorio: cuatro tarjetas superiores, proyectos y evaluación en dos columnas, recomendación a lo ancho. En tablet: tarjetas en dos columnas; en móvil: una columna y contenido sin desbordes. Mantener fondo claro, tarjetas blancas, azul para acciones y colores semánticos acompañados de texto e iconos.

No copiar nombres, notas, fechas, cantidades, porcentajes ni recomendaciones del ejemplo. Tampoco mostrar «Última sincronización» ni el toast «Datos sincronizados» hasta contar con una respuesta real que lo respalde. El acceso «Ver todos» puede utilizar `/projects`, que ya existe.

## Estado de datos y límites de la primera entrega

Representar explícitamente estos estados, sin confundirlos:

- **Integración pendiente:** estado inicial real de esta entrega. Mantener los bloques visibles, sin skeleton permanente, peticiones ni reintentos ficticios.
- **Cargando:** reservado para una consulta real en curso, con skeleton accesible.
- **Vacío confirmado:** una respuesta real indica que no hay proyectos o evaluaciones. Un cero solo se muestra si lo devuelve una fuente real.
- **Disponible o parcial:** cada bloque presenta únicamente la información recibida; `null` se muestra como pendiente, nunca como cero. Una ausencia de nota no equivale a un pipeline fallido.
- **Error:** al incorporar la consulta, mostrar aviso y reintento real. Evitar presentar un fallo de red como ausencia de proyectos.

En la primera entrega solo se activa «Integración pendiente». Los componentes aceptarán información tipada para que la integración no obligue a rehacer su estructura.

## Organización técnica

Usar `features/metrics`, que ya contiene el modelo de lectura del resumen docente, con archivos propios para el estudiante:

```text
features/metrics/
  domain/entities/student-overview.entity.ts
  presentation/
    pages/student-dashboard.page.tsx
    components/
      student-summary-cards.tsx
      student-projects-overview.tsx
      student-latest-evaluation.tsx
      student-next-step.tsx
    styles/student-dashboard.css
  index.ts
```

Definir un modelo de presentación independiente del DTO futuro: indicadores opcionales, proyectos, última ejecución, última evaluación y recomendación. Las notas deben contemplar su escala; las métricas, sus unidades. No declarar este modelo como contrato del backend.

La página obtiene el saludo desde `useAuth` y entrega a los widgets un estado explícito de integración pendiente. No crear un repositorio que devuelva una lista vacía para simular una consulta exitosa, ni un hook de React Query sin servicio real. No almacenar datos remotos en Zustand.

Exportar la página desde la API pública de Metrics y cargarla desde el router. Seleccionar la nueva pantalla para `STUDENT`, respetando la precedencia actual de roles para cuentas con varios roles y preservando el acceso de los demás usuarios. En la navegación del estudiante, cambiar «Vista general» a «Resumen». No cambiar el destino del login como parte de este alcance.

## Integración posterior

Antes de activar consultas, confirmar con backend:

1. Si habrá una consulta agregada del resumen o composición de servicios existentes, sus rutas y DTOs.
2. Alcance del estudiante autenticado, cursos incluidos y permisos. La identidad debe resolverse y validarse en backend.
3. Periodo de «pipelines recientes», definición de proyecto activo/finalizado y total usado en Quality Gates.
4. Escala y origen de la calificación actual; diferencia entre nota técnica, provisional y revisión docente.
5. Unidades de deuda técnica y cobertura, significado de vulnerabilidades y estados de cumplimiento. El frontend no inventará umbrales ni calculará notas.
6. Criterio para elegir la última ejecución/evaluación, fecha de generación del resumen y datos para enlazar sus detalles.
7. Origen de recomendaciones, disponibilidad de su destino, semántica de valores nulos y errores.
8. Paginación o límite de la lista de proyectos y significado de «Ver todos».

Con contrato confirmado, añadir el flujo página → hook React Query → caso de uso → repositorio → API service → cliente HTTP existente, con validación Zod y mapper. Registrar dependencias en el contenedor actual. Las claves de consulta incluirán identidad y filtros relevantes para evitar reutilizar datos entre sesiones. Respetar las APIs públicas entre features y las reglas de arquitectura.

Activar los accesos a ejecución, resultados y orientación solo cuando existan datos y rutas funcionales. La ruta actual de detalle de proyecto muestra un aviso en modo real; no tratarla como detalle integrado. Añadir actualización manual o toast de sincronización únicamente si la consulta real lo permite.

## Orden de implementación y aceptación

1. Crear el modelo de presentación y los widgets con sus estados pendientes.
2. Construir la página responsive siguiendo la referencia y reutilizando botones, iconos y tokens existentes.
3. Integrar la ruta y la etiqueta «Resumen» para estudiante, preservando otros roles.
4. Revisar teclado, foco visible, encabezados, contraste y lectura accesible de valores ausentes. Explicar acciones deshabilitadas con texto, sin depender de hover.
5. Verificar en escritorio y móvil que la composición siga siendo legible sin datos; comprobar saludo real y ausencia de solicitudes del resumen o mensajes de éxito ficticios.
6. Ejecutar typecheck, lint/reglas de arquitectura y build. Cubrir con pruebas de ruta la selección por rol y la preservación de acceso; verificar el estado pendiente y las acciones deshabilitadas sin incorporar fixtures ni handlers del resumen.

La primera entrega se considera lista cuando el estudiante puede abrir su resumen completo en estructura, sin información inventada ni consultas no acordadas. La disponibilidad de métricas reales es una segunda etapa sujeta al contrato del backend.
