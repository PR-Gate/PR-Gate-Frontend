export const navigation = [
  { path: '/dashboard', label: 'Resumen', icon: 'dashboard' },
  { path: '/pipelines', label: 'Pipelines', icon: 'pipelines' },
  { path: '/projects', label: 'Proyectos', icon: 'projects' },
  { path: '/my-rubric', label: 'Mi rúbrica', icon: 'rubrics' },
  { path: '/practice', label: 'Mis tests', icon: 'practice' },
  { path: '/notifications', label: 'Notificaciones', icon: 'notifications' },
  { path: '/profile', label: 'Mi perfil', icon: 'settings' },
] as const;
export const teacherRoutes = [
  { path: '/teacher/dashboard', title: 'Panel docente' },
  { path: '/teacher/projects', title: 'Proyectos del curso' },
  { path: '/teacher/rubrics', title: 'Rúbricas académicas' },
  { path: '/teacher/evaluations', title: 'Tests y evaluaciones' },
  { path: '/teacher/analytics', title: 'Learning Analytics' },
] as const;
export const teacherNavigation = [
  { path: '/teacher/dashboard', label: 'Resumen', icon: 'dashboard' },

  {
    path: '/teacher/courses',
    label: 'Mis cursos',
    icon: 'courses',
  },
  {
    path: '/teacher/students',
    label: 'Estudiantes',
    icon: 'students',
  },
  { path: '/projects', label: 'Proyectos', icon: 'projects' },
  { path: '/teacher/rubrics', label: 'Rúbricas', icon: 'rubrics' },
  {
    path: '/teacher/evaluations',
    label: 'Tests y evaluaciones',
    icon: 'rubrics',
  },
  {
    path: '/teacher/analytics',
    label: 'Learning Analytics',
    icon: 'analytics',
  },
  { path: '/notifications', label: 'Notificaciones', icon: 'notifications' },
  { path: '/profile', label: 'Configuración de perfil', icon: 'settings' },
] as const;
export const adminRoutes = [
  { path: '/admin/dashboard', title: 'Administración' },
  { path: '/admin/users', title: 'Gestión de usuarios' },
] as const;
export const studentRoutes = {
  list: '/teacher/students',
  detail: '/teacher/students/:studentId',
} as const;
