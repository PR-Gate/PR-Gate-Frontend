import {
  Bell,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/shared/services/auth/auth-context';
import { useUiStore } from '@/shared/stores/ui.store';
import { Button } from '@/shared/components/ui/button';
import { navigation } from '../config/routes.config';
const icons = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  feedback: MessageSquareText,
  practice: Sparkles,
  notifications: Bell,
};
export function DashboardLayout({ demo }: { demo: boolean }) {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUiStore();
  const location = useLocation();
  const current =
    navigation.find((item) => location.pathname.startsWith(item.path))?.label ??
    'Espacio académico';
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-3"
      >
        Saltar al contenido
      </a>
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          onClick={closeSidebar}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#294039] bg-[#142b26] text-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Link to="/dashboard" className="flex h-20 items-center gap-3 px-7">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#b9e4bc] text-[#142b26]">
            <ShieldCheck size={23} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            PR Gate<span className="ml-1 text-[#b9e4bc]">.</span>
          </span>
        </Link>
        <div className="mx-4 mb-8 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <GraduationCap size={20} className="text-[#b9e4bc]" />
          <div className="flex-1">
            <p className="text-sm font-medium">Espacio académico</p>
            <p className="mt-0.5 text-[11px] text-white/45">
              Orquestación pedagógica
            </p>
          </div>
          <ChevronsUpDown size={14} className="text-white/40" />
        </div>
        <p className="mb-3 px-7 text-[10px] font-semibold tracking-[.15em] text-white/35">
          PRINCIPAL
        </p>
        <nav aria-label="Navegación principal" className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = icons[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${isActive ? 'bg-[#b9e4bc] font-semibold text-[#142b26]' : 'text-white/65 hover:bg-white/5 hover:text-white'}`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        {user?.roles.some((role) => ['TEACHER', 'ADMIN'].includes(role)) && (
          <div className="mt-8 px-7">
            <p className="mb-4 text-[10px] font-semibold tracking-[.15em] text-white/35">
              GESTIÓN ACADÉMICA
            </p>
            <Link
              to="/teacher/dashboard"
              onClick={closeSidebar}
              className="flex items-center gap-3 text-sm text-white/65"
            >
              <BookOpen size={18} />
              Panel docente
            </Link>
            {user.roles.includes('ADMIN') && (
              <Link
                to="/admin/dashboard"
                onClick={closeSidebar}
                className="mt-5 flex items-center gap-3 text-sm text-white/65"
              >
                <ShieldCheck size={18} />
                Administración
              </Link>
            )}
          </div>
        )}
        <div className="mt-auto px-5 pb-5">
          <div className="mb-5 rounded-lg border border-white/10 p-4">
            <CircleHelp size={18} className="mb-2 text-[#b9e4bc]" />
            <p className="text-xs font-medium">El código también enseña.</p>
            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Conecta el trabajo de tu equipo con evidencia de aprendizaje.
            </p>
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 pt-5">
            <Link
              to="/profile"
              aria-label="Ver perfil"
              className="flex size-9 items-center justify-center rounded-full bg-[#d8e8dc] text-xs font-semibold text-[#142b26]"
            >
              {user?.name
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('')}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user?.name}</p>
              <p className="mt-1 text-[10px] text-white/40">
                {user?.roles.join(' · ')}
              </p>
            </div>
            <button
              onClick={() => {
                void logout();
              }}
              aria-label="Cerrar sesión"
              className="rounded p-2 text-white/50 hover:bg-white/10"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="flex h-20 items-center justify-between gap-3 border-b border-border bg-white px-5 sm:px-9">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
              aria-label={
                sidebarOpen ? 'Cerrar navegación' : 'Abrir navegación'
              }
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Link to="/dashboard" className="hidden sm:block">
                Espacio académico
              </Link>
              <ChevronRight size={12} className="hidden sm:block" />
              <span aria-current="page" className="font-medium text-foreground">
                {current}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {demo && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-medium text-amber-800">
                DEMO · Datos simulados
              </span>
            )}
            <Link
              to="/notifications"
              aria-label="Notificaciones"
              className="rounded-lg p-2 hover:bg-muted"
            >
              <Bell size={18} />
            </Link>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-[1500px] px-5 py-9 sm:px-9"
        >
          <Outlet />
        </main>
        <footer className="flex flex-wrap justify-between gap-2 px-9 py-7 text-[11px] text-muted-foreground">
          <span>PR Gate · Del código al aprendizaje</span>
          <span>Auditoría técnica · Evidencia · Mejora continua</span>
        </footer>
      </div>
    </div>
  );
}
