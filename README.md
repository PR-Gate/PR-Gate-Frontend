# PR Gate Frontend

Antes de implementar o modificar una sección, consultar el [contexto y acuerdos del proyecto](docs/project-context/README.md): arquitectura, endpoints simulados, integración futura con backend y conservación de funcionalidades existentes.

Base ejecutable de la plataforma de orquestación pedagógica para proyectos universitarios. React consume microservicios REST mediante un API Gateway. La auditoría técnica determinista, la evaluación académica, los pipelines y la integración con LLM pertenecen al backend.

## Inicio rápido

Requiere Node.js LTS 22.12+ (validado con Node 24.18.0) y npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Si PowerShell bloquea `npm.ps1`, utiliza `npm.cmd`. Abre la URL de Vite (normalmente `http://localhost:5173`) y pulsa **Explorar demostración** para ingresar como docente. No requiere credenciales ni backend: MSW intercepta las solicitudes de Axios.

La demostración permite listar, buscar, filtrar, cambiar entre tarjetas y tabla, consultar detalle y crear proyectos con validación. Incluye además el resumen docente con indicadores y reportes simulados. Los datos viven en memoria del worker y se reinician al recargar. Los repositorios y proyectos de ejemplo son ficticios. Las secciones aún no implementadas indican su estado pendiente.

## Comandos

| Comando                                   | Función                           |
| ----------------------------------------- | --------------------------------- |
| `npm run dev`                             | Desarrollo local                  |
| `npm run typecheck`                       | TypeScript estricto               |
| `npm run lint`                            | ESLint y límites arquitectónicos  |
| `npm run architecture`                    | Dependencias prohibidas y ciclos  |
| `npm test`                                | Vitest, RTL y MSW sin backend     |
| `npm run test:watch`                      | Pruebas durante desarrollo        |
| `npm run build`                           | TypeScript y bundle de producción |
| `npm run preview`                         | Servir bundle generado            |
| `npm run format` / `npm run format:check` | Aplicar / comprobar Prettier      |

El build compila sin credenciales, pero el **arranque del bundle de producción exige OIDC configurado y mocks desactivados**. Un bundle compilado con `.env` de demostración muestra un error de configuración en producción. Configura `.env.production.local` antes de generar el artefacto para despliegue; utiliza `npm run dev` para la demo. El hosting debe redirigir las rutas SPA a `index.html`.

## Tecnologías

La sección docente **Estudiantes** está disponible en `/teacher/students`: permite elegir curso, buscar, abrir contribuciones/evidencias y exportar la lista visible a CSV. Usa Axios y MSW a través de casos de uso y repositorio dentro de Users. Los indicadores son orientativos, nunca calificaciones calculadas en React. Consulta [la implementación y endpoints provisionales](docs/students.md).

**Rúbricas** está disponible para Docente en `/teacher/rubrics`, y **Mi rúbrica** para Estudiante en `/my-rubric`. Incluye biblioteca, criterios/niveles, publicación y carga simuladas, y evidencia de resultados de solo lectura. Todas las operaciones consumen endpoints de MSW a través de casos de uso y repositorios; no usan una biblioteca local como sustituto del flujo HTTP. Consulta [la implementación y la migración futura](docs/rubrics.md).

La sección **Tests y evaluaciones** está disponible para el rol Docente en `/teacher/evaluations`. Permite crear borradores, configurar preguntas y destinatarios, publicar/programar, revisar entregas y consultar resultados con datos de MSW. Los recordatorios son simulados y los cambios se reinician al recargar. Consulta [el funcionamiento y la integración futura](docs/assessments.md).

El resumen docente está disponible en `/teacher/dashboard`: entra en demo como Docente y pulsa **Resumen**. Incluye cursos/periodos, KPIs, donut, actividad, tabla con búsqueda, muestra de estudiantes y exportación CSV. Todos los datos pasan por MSW; `GET /demo/teacher-overview` es un contrato provisional. GitHub y el backend real siguen pendientes. Consulta [el estado y contrato del dashboard](docs/teacher-dashboard-plan.md).

React, TypeScript strict, Vite, React Router lazy, Tailwind CSS 4 y componentes locales con patrón shadcn/ui (Radix, CVA, `cn`, `components.json`), Lucide, TanStack Query, Zustand solo para sidebar, React Hook Form, Zod, Axios, oidc-client-ts, Vitest, Testing Library, MSW, ESLint, Prettier y dependency-cruiser. Versiones exactas en `package.json` y lockfile; utiliza `npm ci` en CI.

## Arquitectura Feature-Based + DDD + Hexagonal

| Capa           | Responsabilidad y dependencias                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Domain         | Entidades, tipos, reglas de uso del modelo y contratos de repositorio. TypeScript puro sin React, Axios, infraestructura o presentación. |
| Application    | Casos de uso que reciben interfaces del dominio. Sin implementaciones concretas ni HTTP.                                                 |
| Infrastructure | API services, validación de DTO externos, mappers, repositorios y adaptadores OIDC. Depende hacia adentro.                               |
| Presentation   | Páginas, componentes, hooks Query, formularios y schemas UI. Consume casos de uso, nunca Infrastructure o Axios.                         |
| App            | Configuración, Composition Root, providers, layouts y routing. Ensambla las capas.                                                       |
| Shared         | UI e infraestructura técnica reutilizable. No depende de app/features ni almacena entidades de negocio.                                  |

No hay framework de DI ni singletons de repositorios. `app/di/container.ts` crea HTTP → API service → repository → use cases. `app-providers.tsx` inyecta las operaciones en un contexto tipado de Presentation. Los DTO no llegan a React. Cada App tiene su QueryClient. El estado remoto vive en Query, nunca en Zustand.

### Flujo de Projects implementado

```text
ProjectsPage → useProjects (TanStack Query) → GetProjectsUseCase
  → ProjectRepository (puerto)
  ← ProjectRepositoryImpl (adaptador)
  → ProjectApiService → HttpClient / Axios → API Gateway → Projects Microservice
```

MSW sustituye la frontera HTTP; el resto de capas es real. Zod valida las respuestas y `ProjectMapper` convierte snake_case, estados externos y fechas ISO al modelo interno. `canOpenRepository` evita enlaces no HTTPS; no evalúa calidad ni califica estudiantes.

También existen GetProjectByIdUseCase y CreateProjectUseCase. La mutación invalida `projectKeys.all`. Query presenta loading/error/empty/success y propaga AbortSignal hasta Axios. No reintenta errores 4xx; otros errores tienen un reintento. Los schemas de formulario permanecen separados de los DTO HTTP.

### Reglas automáticas

`.dependency-cruiser.cjs` rechaza ciclos, dependencias externas desde Domain, capas externas desde Application, Infrastructure o HTTP desde Presentation y acceso a internals de otro feature. Los imports entre features pasan por `index.ts`. App puede importar internals para composición y rutas. Los tests pueden acceder a Vitest y helpers; esa excepción no afecta al código productivo.

ESLint comprueba hooks y rechaza `any` explícito; TypeScript rechaza `any` implícito. Detectar lógica extensa o duplicación semántica requiere además revisión humana.

## Estructura implementada

```text
.
├── .dependency-cruiser.cjs / .env.example / .gitignore
├── .prettierrc / .prettierignore / components.json
├── eslint.config.js / vite.config.ts / index.html
├── package.json / package-lock.json / tsconfig*.json
├── docs/ (decisiones e inventario completo de archivos)
├── public/mockServiceWorker.js
└── src/
    ├── main.tsx / vite-env.d.ts
    ├── app/
    │   ├── app.tsx
    │   ├── config/ (entorno, navegación, QueryClient)
    │   ├── di/ (container y dependencias)
    │   ├── layouts/ (auth, dashboard, main)
    │   ├── providers/ (auth, query, app)
    │   └── router/ (rutas, guards, dashboard, 403 y 404)
    ├── features/
    │   ├── projects/
    │   │   ├── domain/ (Project, regla de enlace, repositorio)
    │   │   ├── application/use-cases/ (listar, detalle, crear)
    │   │   ├── infrastructure/ (services, repositories, mappers, dto)
    │   │   ├── presentation/ (pages, components, hooks, schemas)
    │   │   └── index.ts
    │   ├── users/ (identidad, adaptadores OIDC/demo, login y perfil)
    │   ├── cicd/ (pipelines y Quality Gates)
    │   ├── metrics/ (métricas)
    │   ├── ai-practice/ (feedback y práctica)
    │   └── notifications/ (avisos)
    ├── shared/
    │   ├── components/ (ui, feedback, common)
    │   ├── services/ (auth, http)
    │   ├── stores/ui.store.ts
    │   ├── styles/globals.css
    │   └── utils/cn.ts
    └── testing/ (MSW, fixtures, setup, providers)
```

Consulta [el inventario de archivos](docs/file-tree.txt) y [las decisiones arquitectónicas](docs/architecture.md). Los tests se ubican junto a la unidad verificada. Las capas pendientes contienen documentación de contratos; no hay entidades, services o endpoints vacíos para completar un árbol.

## API Gateway y services

Configura `VITE_API_BASE_URL` como `/api` para mismo origen o la URL HTTPS del gateway. Las variables `VITE_*` son públicas: nunca incluyas secretos. Axios tiene timeout de 15 segundos, bearer token en memoria, normalización de errores y expiración de sesión en 401. Los componentes no realizan solicitudes.

**Contrato provisional de demostración**, pendiente de acordar con Spring Boot:

| Método | Ruta relativa al gateway | Respuesta                           |
| ------ | ------------------------ | ----------------------------------- |
| GET    | `/projects`              | `{ data: ProjectResponseDto[] }`    |
| GET    | `/projects/:id`          | `ProjectResponseDto`                |
| POST   | `/projects`              | `ProjectResponseDto` con status 201 |

POST recibe `name`, `description`, `course_name`, `repository_url`. El DTO devuelto añade `id`, `status` (`ACTIVE` o `ARCHIVED`), `member_count` y `updated_at` ISO. Confirma rutas, paginación, permisos y formatos antes de integrar: adapta API service, schema y mapper sin cambiar componentes.

Metrics implementa el resumen docente con el contrato provisional de MSW `/demo/teacher-overview`; las métricas específicas de proyecto y los otros contextos siguen pendientes de contratos REST reales. Sus API services se incorporarán al acordar endpoints y DTOs; las páginas iniciales no envían solicitudes ficticias. No se crean Application Services ni Domain Services cuando un caso de uso basta.

## Cognito / OIDC

La demo solo está permitida con mocks y fuera de producción. No otorga acceso al backend. Para producción crea `.env.production.local` con valores reales:

```dotenv
VITE_AUTH_MODE=oidc
VITE_ENABLE_MOCKS=false
VITE_API_BASE_URL=<URL real del API Gateway>
VITE_OIDC_AUTHORITY=<issuer del user pool>
VITE_OIDC_CLIENT_ID=<app client público sin secret>
VITE_OIDC_REDIRECT_URI=<URL absoluta de la SPA terminada en /login>
VITE_OIDC_LOGOUT_URI=<URL de salida permitida de la SPA>
VITE_COGNITO_LOGOUT_URL=<endpoint /logout del dominio Cognito configurado>
```

Los marcadores `<...>` no son valores utilizables. No se ha inventado ningún tenant, client ID o credencial. Registra las URLs exactas en Cognito, habilita Authorization Code con PKCE y scopes `openid email profile`. Usa HTTPS excepto localhost; configura CORS y valida access tokens y autorizaciones en gateway/backend.

`oidc-client-ts` gestiona PKCE, state y nonce; no se implementa criptografía propia. Tokens de acceso/refresh permanecen en memoria (`InMemoryWebStorage`). `sessionStorage` solo contiene el estado transitorio del redirect. Al recargar se intenta recuperar sesión mediante el proveedor; si el navegador bloquea la recuperación silenciosa se requiere login controlado. Las callbacks en iframe usan `signinSilentCallback`.

La expiración del token o un 401 elimina la sesión y caché; ProtectedRoute redirige al login. Logout limpia el estado local y utiliza Cognito `/logout` con `client_id` y `logout_uri`. Los grupos se leen como `STUDENT`, `TEACHER`, `ADMIN`: confirma estos nombres con el backend. Los guards son ayudas visuales; el backend decide los permisos reales. La conexión con un tenant no se ha validado sin su configuración.

Referencias: [oidc-client-ts](https://authts.github.io/oidc-client-ts/classes/UserManager.html), [logout de Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html), [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite).

## Navegación e interfaz

`app/config/routes.config.ts` centraliza navegación y rutas de gestión; `app/router/app-router.tsx` contiene el árbol de rutas. Incluye todas las rutas solicitadas: públicas, generales, docentes y administrativas. Las páginas de features se cargan con lazy loading. ProtectedRoute espera recuperación de sesión; RoleGuard requiere TEACHER/ADMIN o ADMIN según la sección. Hay layouts, Suspense, error boundary de React Router y 404.

La UI incluye sidebar responsive, header, breadcrumbs, dashboard, cards, tabla, badges, modal Radix accesible, formulario RHF/Zod, skeletons, estados vacíos/error y toasts. El modal admite foco y Escape. El estado de sidebar reside en Zustand.

## Cómo extender el proyecto

1. **Feature:** acuerda el contexto y contrato backend; crea archivos reales en domain/application/infrastructure/presentation. Agrega el contexto a las reglas de dependency-cruiser y exporta solo lo necesario en `index.ts`.
2. **Service:** define DTO y schema Zod en Infrastructure. Inyecta HttpClient en `<feature>-api.service.ts`. Encapsula endpoints/serialización, sin reglas de negocio. Reutiliza interceptores compartidos.
3. **Repository:** declara el contrato en Domain; implementa en Infrastructure inyectando el API service y transformando con un mapper. No dupliques el mismo puerto en Application.
4. **Use Case:** recibe el contrato por constructor y expresa una operación. Prueba con repositorio simulado; crea Application Service solo para coordinar varias operaciones.
5. **DI:** instancia service → repository → use case en app/di; expón operaciones a Presentation mediante contexto tipado.
6. **Hook Query:** utiliza `useQuery({ queryKey, queryFn: ({ signal }) => useCase.execute(signal) })`; define keys por feature e invalida las afectadas en mutaciones.
7. **Página:** consume hooks y presenta loading/error/empty/success. Valida formularios en Presentation y agrega rutas lazy/guards.

## Pruebas

Cubren entidad/regla de Project, caso de uso con repositorio simulado, mapper, Axios/MSW, bearer/401, respuestas inválidas, creación/detalle, hook, página, filtros, formulario e invalidación. También verifican entorno y acceso por rol. No dependen de backend real.

Ejecuta typecheck, lint, test, build y format:check. No se configuró Playwright: estas pruebas de UI usan jsdom, no un navegador E2E. Cognito real, CORS y apariencia visual requieren validación adicional en los entornos correspondientes.
