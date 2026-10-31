# Rúbricas: implementación y conexión futura

## Decisión de arquitectura

Este módulo sigue el contexto de Orquestador Académico, incluso cuando un prompt de UI mencione únicamente estado local. La fuente de datos es una API simulada por MSW y no una lista mantenida en componentes:

```text
Página → hook TanStack Query → caso de uso → RubricRepository
  ← RubricRepositoryImpl → RubricApiService → HttpClient / Axios → MSW
```

El estado local de React conserva únicamente filtros, edición, criterios/niveles antes de guardar, archivo seleccionado, selección de criterio y modales. Las consultas y mutaciones pasan por los puertos inyectados desde `app/di`. No se guardan rúbricas, documentos ni resultados en localStorage. Los datos se reinician al recargar el worker de demostración.

`features/rubrics` es una feature de autoría y consulta académica del frontend; no presupone un nuevo microservicio ni modifica los seis dominios backend existentes. El servicio responsable y los endpoints reales se acordarán cuando el backend esté disponible.

## Experiencia docente

Ruta `/teacher/rubrics`, accesible únicamente con rol `TEACHER`. Un administrador sin ese rol tampoco puede editar. La biblioteca permite buscar por nombre, filtrar por curso/estado, ver, editar, duplicar, publicar, archivar y eliminar. Archivar y eliminar requieren confirmación.

El editor permite guardar borradores incompletos, asociar curso/sección, agregar/editar/duplicar/eliminar/reordenar criterios y configurar evidencias, tipos de evaluación y niveles. Cada nivel tiene nombre, descripción, condición textual y puntaje; puede editarse, eliminarse con confirmación y reordenarse.

El total se calcula durante la **autoría** y se compara con el puntaje esperado del curso, devuelto por el catálogo del servicio. Se valida nombre, curso, sección, criterios, puntajes y niveles de criterios automáticos antes de publicar; el mock repite la validación en la frontera HTTP. Estas son comprobaciones de configuración, no la evaluación de un estudiante. Las condiciones de los niveles nunca se interpretan ni ejecutan en React.

Publicar requiere confirmación con nombre, curso, cantidad de criterios, puntaje y tipos de evaluación. El editor guarda primero un borrador y luego solicita su publicación. Si publicar falla, conserva el ID del borrador para reintentar sin duplicarlo. Cerrar una edición con cambios requiere confirmación.

Editar una rúbrica publicada o archivada inicia un **nuevo borrador de versión**. La versión anterior y los resultados asignados permanecen intactos. Duplicar crea una copia independiente con IDs nuevos para criterios/niveles. El versionado actual es provisional y deberá quedar bajo control del backend con control de concurrencia.

## Importación simulada

Se aceptan PDF, DOC, DOCX, XLS y XLSX, no vacíos y de hasta 10 MiB. Hay selección/arrastre, metadatos, estado de carga, eliminación del archivo y errores. El navegador **no lee, analiza ni extrae el contenido**. El API service envía únicamente nombre, tamaño y tipo a un endpoint de preview simulado por MSW.

Tras la respuesta se abre el editor con criterios explícitamente identificados como ejemplos. No se guardan hasta que el docente revise y confirme. No se presenta la plantilla como contenido extraído del archivo real.

Cuando exista importación real será necesario acordar un endpoint de subida de archivos (por ejemplo multipart), un contrato de extracción asíncrona y su validación. Eso puede requerir ampliar el puerto de importación; hoy no hay subida de bytes ni procesamiento de documentos.

## Experiencia del estudiante

Ruta `/my-rubric`, con rol `STUDENT`; la sidebar muestra **Mi rúbrica**, nunca la biblioteca docente. Un docente sin rol de estudiante no puede abrir esta ruta. La vista no expone crear, subir, editar o publicar.

El endpoint asignado devuelve una **instantánea de versión** y todos los resultados, evidencias, recomendaciones y porcentajes. La UI muestra curso, proyecto, versión, estado de revisión y puntaje; seleccionar un criterio abre su trazabilidad y evidencia completa. El reporte completo se muestra como texto de ejemplo, sin enlaces ficticios a proveedores externos.

Las fixtures distinguen la cobertura técnica de 72% del cumplimiento académico de 60% (3/5 puntos). La regla de la versión de ejemplo asigna 3 puntos al intervalo 70–79%, de forma coherente entre niveles, regla y evidencia. No se calcula ninguna calificación a partir de la cobertura en React. El total 15.5/20, el porcentaje y cada puntaje se reciben del servicio simulado. La decisión final se identifica como pendiente de revisión docente.

Modificar, archivar o eliminar de la biblioteca no altera la instantánea asignada. La asignación real de nuevas versiones a cursos/estudiantes no está implementada ni se simula como un cambio de calificación existente.

## Contratos provisionales de MSW

Rutas relativas a `VITE_API_BASE_URL`; **no son endpoints backend confirmados**.

| Método | Ruta                           | Operación                                                       |
| ------ | ------------------------------ | --------------------------------------------------------------- |
| GET    | `/demo/rubrics`                | Biblioteca y catálogo de cursos/secciones                       |
| POST   | `/demo/rubrics`                | Crear borrador, incluso incompleto                              |
| POST   | `/demo/rubrics/:id/draft`      | Actualizar un borrador                                          |
| POST   | `/demo/rubrics/:id/publish`    | Validar y publicar                                              |
| POST   | `/demo/rubrics/:id/duplicate`  | Copiar como borrador independiente                              |
| POST   | `/demo/rubrics/:id/archive`    | Archivar                                                        |
| POST   | `/demo/rubrics/:id/delete`     | Eliminar de la biblioteca                                       |
| POST   | `/demo/rubrics/import-preview` | Metadatos de archivo → criterios de ejemplo                     |
| GET    | `/demo/rubrics/assigned`       | Instantánea y resultados del estudiante de demostración, o null |

Zod valida las respuestas externas. El mapper convierte `total_score`, `updated_at` y campos de la consulta asignada al modelo interno. Las mutaciones invalidan la biblioteca con TanStack Query. No invalidan ni recalculan los resultados de una versión ya asignada.

En modo de autenticación OIDC real las dos rutas muestran un aviso de integración pendiente y no solicitan estos endpoints de demo. Los guards son controles de interfaz; la autorización real por rol, curso, docente y estudiante deberá ejecutarse en backend.

## Integración posterior

1. Definir el servicio propietario, rutas del gateway, formatos, filtros/paginación y autorización por curso.
2. Confirmar escalas de puntaje, precisión decimal, criterios, niveles, fuentes de evidencia y representación ejecutable de condiciones en backend. Las condiciones textuales actuales son descripciones de autoría, no código.
3. Acordar publicación, versiones inmutables, asignaciones, auditoría, archivos y control de edición concurrente. Definir si eliminar equivale a borrado lógico y cómo se conservan las versiones ya utilizadas.
4. Adaptar API service, DTOs y mappers, manteniendo los casos de uso y las pantallas cuando el contrato lo permita. Incorporar subida real y estados de extracción solo al disponer del servicio correspondiente.
5. Hacer que el backend entregue puntajes, regla aplicada, evidencia, nivel, porcentaje y recomendación. No trasladar reglas de evaluación ni integración con LLM a React.
6. Validar JWT, 401/403, aislamiento de datos y permisos. Retirar el bloqueo de integración real únicamente cuando esas comprobaciones pasen.
7. Conservar MSW y las fixtures para desarrollo y pruebas. No activar servicios reales automáticamente.

## Pruebas y verificación

Cobertura de suma/validación de autoría, casos de uso con repositorios simulados, Axios/MSW, transformación de DTOs, inmutabilidad de la instantánea, importación sin lectura del archivo, hooks e invalidación. Las pruebas de rutas cubren filtros, borradores incompletos, criterio/nivel, publicación confirmada, duplicación, reordenación, eliminación/archivo, cierre con cambios y consulta de evidencia solo lectura, además de permisos y reintento de errores.

Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run format:check`. Los estilos apilan biblioteca, formularios y paneles en móvil; el editor amplio usa pantalla completa y mantiene total/acciones visibles. La revisión visual en navegador a 1440×1024, 1280×800 y móvil requiere un entorno de navegador; las pruebas de integración usan jsdom.
