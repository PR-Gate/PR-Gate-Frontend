import { create } from 'zustand';
interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleCollapsed(): void;
  toggleSidebar(): void;
  closeSidebar(): void;
}
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  toggleCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
