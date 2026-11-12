# Contexto y acuerdos del proyecto

Vinculación GitHub: consultar [contrato y estado de integración](../github-link.md).
Por solicitud posterior del usuario, se admiten repositorios privados y organizaciones
autorizados mediante la GitHub App. Las credenciales GitHub se cifran en Users
con AES-256-GCM y una clave privada de entorno; nunca llegan al frontend.
V4 conserva las identidades existentes y requiere renovar la autorización.
El usuario aplica las migraciones mediante su propio arranque del servicio.
El arranque normal usa Keycloak y servicios locales, sin MSW. El backend incorpora
la resolución del perfil académico. El usuario actualizó el servicio sobre su
base existente y el log confirmó V3 aplicada y arranque correcto con Keycloak.
La autorización GitHub real aún debe verificarse.

Por solicitud del usuario, `/register` permite elegir Docente o Estudiante antes
de continuar con Keycloak. El backend valida y persiste la elección únicamente
al crear el perfil inicial; no permite ADMIN ni cambia roles existentes desde
el registro. `/account` permite completar esa elección si la identidad Keycloak
ya existe pero falta el perfil académico. El Compose normal conserva los perfiles
local,keycloak para que no desaparezcan los endpoints de sesión al reiniciar.

Este documento reúne las decisiones que deben conservarse al implementar nuevas secciones de **PR Gate**. Los prompts de diseño pueden no conocer este contexto: sus propuestas visuales deben adaptarse a la solución existente.

El nombre oficial de la solución es **PR Gate**. Utilizarlo en el login, la navegación, los títulos, las exportaciones y la documentación, aunque una referencia visual o un prompt genérico muestre otra marca.

Si una instrucción posterior cambia explícitamente un acuerdo, actualizar este documento para mantener una referencia vigente.

## 1. Contexto de la solución

La plataforma acompaña proyectos universitarios de desarrollo de software mediante evidencia técnica, pipelines CI/CD, Quality Gates, rúbricas, evaluación académica y retroalimentación pedagógica.

Existen experiencias diferenciadas para docentes y estudiantes. El backend previsto utiliza Java/Spring Boot, microservicios y APIs REST mediante un API Gateway. Sus seis dominios son Users, Projects, CI/CD, Metrics, AI Practice y Notifications. Una nueva feature frontend no implica crear un nuevo microservicio.

## 2. Integración progresiva con el backend local

**El arranque normal no usa datos mockeados.** Se está conectando sesión, perfil
académico y GitHub con users-service local. Las demás secciones conservan su bloqueo
hasta confirmar y conectar sus contratos. MSW y fixtures permanecen para pruebas
y para la demo explícita, fuera del flujo normal.

Flujo que deben seguir las operaciones de negocio:

```text
Página / componente
  → hook con TanStack Query
  → caso de uso en Application
  → contrato de repositorio en Domain
  ← implementación del repositorio en Infrastructure
  → API service
  → HttpClient / Axios
  → endpoint del backend (o MSW exclusivamente en pruebas/demo explícita)
```

Cuando esté disponible el backend, la última frontera será API Gateway → microservicio real. Se confirmarán endpoints, DTOs, permisos y formatos; se adaptarán los servicios y mappers conservando las pantallas y los casos de uso cuando el contrato funcional lo permita.

- No sustituir este flujo por listas de negocio mantenidas únicamente con `useState`, aunque un prompt genérico sugiera “sin API” o “solo estado local”.
- Mantener fixtures y handlers de MSW fuera de componentes, en `src/testing/mocks`.
- Identificar los datos, publicaciones, recordatorios, evidencias y cargas simuladas como demostraciones. No afirmar que hubo sincronización, envío de correo o conexión real si no ocurrió.
- Las rutas `/demo/...` son contratos provisionales, no endpoints backend confirmados.
- No inventar URLs reales, credenciales, identificadores de Cognito ni integraciones externas.
- No activar automáticamente los servicios reales. Las secciones que aún tienen un bloqueo de integración real deben conservarlo hasta confirmar el contrato correspondiente.
- Conservar MSW para desarrollo y pruebas después de integrar el backend.

## 3. Arquitectura que se debe respetar

**Feature-Based + capas inspiradas en DDD + Arquitectura Hexagonal**, con composición manual de dependencias.

| Ubicación                           | Responsabilidad                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `features/<feature>/domain`         | Modelos del contexto, tipos y contratos de repositorio. Sin React, Axios ni capas externas.     |
| `features/<feature>/application`    | Casos de uso que reciben puertos internos. Sin HTTP ni implementaciones concretas.              |
| `features/<feature>/infrastructure` | API services, DTOs externos, validación Zod, mappers y adaptadores de repositorio.              |
| `features/<feature>/presentation`   | Páginas, componentes, hooks Query, formularios, schemas de UI y estado temporal de edición.     |
| `app/di`                            | Construcción e inyección de implementaciones concretas.                                         |
| `app`                               | Configuración, providers, layouts, rutas y guards.                                              |
| `shared`                            | UI e infraestructura técnica reutilizable; no entidades de negocio ni dependencias de features. |

`application` **no existe por la ausencia del backend**. Sus casos de uso permanecen con un backend real; solo cambian si cambia la operación que necesita la aplicación. No crear carpetas con solo un README ni abstracciones vacías para completar un árbol.

Los componentes no llaman a Axios ni importan Infrastructure. Los DTOs HTTP no llegan directamente a la UI. Las dependencias entre features pasan por sus APIs públicas; App puede acceder a internals para ensamblar dependencias y rutas. Mantener los controles de dependency-cruiser y evitar ciclos.

## 4. Responsabilidades del frontend y del backend

El frontend presenta datos, recoge formularios, permite configurar pruebas/rúbricas y registra decisiones del docente.

El backend es responsable de ejecutar pipelines, procesar webhooks, aplicar reglas deterministas, evaluar Quality Gates, producir resultados académicos autoritativos e integrar modelos de IA.

- React no debe convertir métricas técnicas en una calificación ni decidir el desempeño de un estudiante.
- Los puntajes, porcentajes, estados, reglas aplicadas, evidencias y recomendaciones de resultados llegan del servicio; hoy los entrega el mock.
- Sumar puntos al **configurar** preguntas o criterios es autoría, no evaluación de entregas. Se permite validar esa configuración en la UI; el backend deberá validarla también.
- Las condiciones textuales de niveles de una rúbrica no se ejecutan como reglas en React.
- La participación y los commits son señales orientativas. Mostrar evidencia y lenguaje de acompañamiento; no presentar conclusiones académicas definitivas.
- La decisión académica final permanece bajo control docente. No atribuirla a la IA.

## 5. Estado, permisos y sesión

- TanStack Query gestiona consultas, mutaciones, caché e invalidación. Incluir curso, estudiante o filtros relevantes en las Query Keys.
- React gestiona estado de edición, filtros, selección de archivos, criterios/niveles sin guardar y modales.
- Zustand se reserva para estado de interfaz compartido, como la sidebar. No duplicar allí datos del servidor.
- Context se utiliza para composición, sesión e inyección de operaciones.
- No guardar rúbricas, tests, respuestas, documentos o tokens sensibles en localStorage. La preferencia de perfil del login es una excepción existente de UI, no una sesión persistida.
- Mantener separados los accesos docente y estudiante mediante navegación y guards. Las secciones docentes implementadas de Tests, Rúbricas y Estudiantes exigen `TEACHER`, incluso para un administrador sin ese rol.
- “Mi rúbrica” es una consulta de solo lectura para `STUDENT`. Las versiones y resultados ya asignados no cambian al editar una rúbrica publicada.
- Una previsualización estudiantil no cambia los permisos reales de la cuenta.
- Conservar login demo, OIDC/PKCE, cierre de sesión, recuperación y rutas protegidas. El backend deberá validar las autorizaciones reales por rol y pertenencia al curso.

## 6. Diseño y experiencia

Reutilizar componentes, estilos y tokens existentes: azul institucional para acciones, azul marino para navegación, superficies blancas y fondo gris azulado. Verde, ámbar y rojo expresan estados y siempre se acompañan de texto o iconos.

Mantener formularios claros, labels visibles, foco, navegación con teclado, estados loading/error/empty/success y diseño responsive. Confirmar acciones destructivas y publicación; avisar antes de descartar cambios sin guardar.

Las cargas de documentos actuales son simuladas: solo se envían metadatos y se muestran plantillas de ejemplo para revisión. No leer ni extraer contenido real hasta implementar y acordar el servicio de importación.

No agregar botones que aparenten funcionar sin hacerlo. Una acción debe tener un comportamiento verificable o explicar que está pendiente de integración.

## 7. No romper lo que ya funciona

Antes de modificar una sección, inspeccionar el código y reutilizar lo existente. Acotar los cambios, conservar el trabajo previo y no reescribir funcionalidades ajenas al pedido.

Verificar según el alcance:

```text
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Agregar pruebas de comportamiento cuando correspondan y mantener las regresiones de login, permisos, dashboard, Projects, Tests, Rúbricas y Estudiantes. No eliminar comprobaciones para ocultar fallos ni reportar resultados que no se ejecutaron.

Una respuesta HTTP 200 o una prueba en jsdom no sustituyen la revisión visual en navegador. Distinguir siempre lo verificado de lo pendiente. Un cambio solo documental no necesita ejecutar toda la suite de la aplicación.

## 8. Referencias de implementación

- [README principal](../../README.md): ejecución y configuración.
- [Arquitectura](../architecture.md): decisiones y límites.
- [Resumen docente](../teacher-dashboard-plan.md): dashboard y contratos provisionales.
- [Tests y evaluaciones](../assessments.md): autoría, publicación y revisión.
- [Rúbricas](../rubrics.md): versiones, importación y consulta estudiantil.
- [Estudiantes](../students.md): listado por curso, contribución y exportación.
- [Inventario de archivos](../file-tree.txt).

## 9. Autenticación local con Keycloak (11 de noviembre de 2026)

npm run dev:keycloak inicia Vite en http://localhost:5173/login con una
configuración explícita que deshabilita la carga de archivos .env. Requiere
Keycloak en localhost:8090, realm prgate y cliente público prgate-frontend.
No activa MSW ni las APIs de negocio en este modo. npm run dev conserva su
comportamiento previo, incluida la demo cuando se configura.

El acceso real ofrece Iniciar sesión y Crear cuenta. El registro usa prompt=create
en una nueva autorización OIDC con PKCE; el formulario y las contraseñas pertenecen
a Keycloak. El selector de perfiles y su preferencia se conservan solo en la demo;
no asignan permisos en el acceso real.

El adaptador admite VITE_OIDC_PROVIDER=keycloak y utiliza el end-session endpoint
OIDC para logout, conservando compatibilidad con Cognito. Los tokens siguen en
memoria, con estado transitorio de protocolo en sessionStorage y renovación
automática en Keycloak. No se muestran JWT ni se guardan tokens en localStorage.

Al completar el login, /account presenta nombre, correo y cierre de sesión. La
identidad se marca academicProfilePending, sin roles de negocio. ProtectedRoute
impide acceder a las demás rutas hasta conectar el perfil académico. Esta pantalla
verifica autenticación, no integración con usuarios, proyectos, rúbricas o IA.
El UUID, rol y estado oficiales de PR-Gate se obtendrán de users-service cuando
se adapte a Keycloak; no se debe tratar el sub de Keycloak como ese UUID local.

Verificación: typecheck, lint, arquitectura y compilación Keycloak local
aprobados; 118 pruebas aprobadas con --maxWorkers=1. La pantalla pública de
registro de Keycloak se comprobó por HTTP. La revisión visual quedó pendiente
porque la herramienta no tenía autorización para usar Chrome. No se crearon
cuentas reales ni se completó una sesión del usuario durante la verificación.
Se preservaron los cambios locales previos de develop.
