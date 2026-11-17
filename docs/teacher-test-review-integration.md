# Revisión docente de tests generados por IA

Pantallas: `/teacher/evaluations` y `/teacher/evaluations/:testId`, protegidas con TeacherOnlyRoute. La primera entrega no consulta endpoints ni presenta datos simulados. La búsqueda y el guardado permanecen deshabilitados hasta integrar datos reales.

El backend debe proporcionar preguntas, respuestas esperadas, criterios de corrección, entregas, puntajes máximos, sugerencias de IA, evidencia y estado de revisión. Las soluciones deben entregarse únicamente a usuarios autorizados; ocultar un botón en frontend no constituye control de acceso.

Para habilitar ajustes, confirmar identidad del docente y permisos sobre curso/entrega, puntaje por pregunta frente a total, escala y redondeo. Validar límites y justificación en frontend y servidor. Conservar puntaje original de IA, puntaje docente, motivo, autor y fecha en una auditoría, sin sobrescribir el historial. Definir control de concurrencia y manejo de conflictos para evitar perder revisiones.

Guardar una revisión y publicar una nota deben tener semántica explícita. Confirmar si el guardado publica resultados o requiere otra acción, el estado final, los permisos posteriores y cuándo puede verlos el alumno. No calcular una nota final ni anunciar un guardado exitoso antes de una respuesta real del servicio.

La integración usará el cliente HTTP, validación de DTOs y el contenedor existentes. Las claves de consulta deben incluir test, entrega e identidad. Los estados de error, vacío confirmado, carga y revisión completada se activarán con el contrato real. La vista actual representa integración pendiente.
