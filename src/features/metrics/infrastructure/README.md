# metrics / infrastructure

Implementado: `MetricsApiService` consume el contrato provisional de MSW `/demo/teacher-overview`. El schema valida DTOs externos y `TeacherOverviewRepositoryImpl` entrega el modelo de dominio mediante el mapper. La ruta no está confirmada por el backend y solo se solicita desde el resumen de demostración. Las métricas específicas por proyecto siguen pendientes de contrato real.

Cobertura, duplicaci?n, deuda t?cnica, vulnerabilidades y contribuciones. Confirmar unidades, ventanas temporales y granularidad.

Implementar API service con HttpClient inyectado, DTO/schema Zod, mapper y repositorio. No consumir el service desde React ni inventar endpoints.

Referencia funcional: features/projects. Los archivos de implementaci?n se a?adir?n progresivamente; esta carpeta documenta el l?mite de la capa.
