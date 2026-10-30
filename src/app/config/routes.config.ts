export const navigation = [
  { path: '/dashboard', label: 'Vista general', icon: 'dashboard' },
  { path: '/projects', label: 'Proyectos', icon: 'projects' },
  { path: '/feedback', label: 'Retroalimentación', icon: 'feedback' },
  { path: '/practice', label: 'Práctica y refuerzo', icon: 'practice' },
  { path: '/notifications', label: 'Notificaciones', icon: 'notifications' },
] as const;
export const teacherRoutes = [
  { path: '/teacher/dashboard', title: 'Panel docente' },
  { path: '/teacher/projects', title: 'Proyectos del curso' },
  { path: '/teacher/rubrics', title: 'Rúbricas académicas' },
  { path: '/teacher/evaluations', title: 'Evaluaciones' },
  { path: '/teacher/analytics', title: 'Learning Analytics' },
] as const;
export const adminRoutes = [
  { path: '/admin/dashboard', title: 'Administración' },
  { path: '/admin/users', title: 'Gestión de usuarios' },
] as const;
