# users / infrastructure

Contiene los adaptadores OIDC/demo existentes y la integración HTTP de Estudiantes: StudentApiService, DTOs Zod, mappers y StudentRepositoryImpl.

StudentApiService recibe HttpClient por inyección y consume los endpoints provisionales de MSW `/demo/students` y `/demo/students/:studentId`, filtrados por curso. Los DTOs externos no llegan a los componentes React.

Cuando el backend esté disponible se confirmarán endpoints del gateway, identidad, permisos, paginación, DTOs y procedencia de los indicadores. No se presupone que las rutas de demo sean contratos reales. Véase docs/students.md.
