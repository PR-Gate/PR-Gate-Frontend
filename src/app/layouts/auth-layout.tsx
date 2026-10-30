import { Outlet } from 'react-router';
export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#142b26] p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-9 shadow-xl">
        <Outlet />
      </div>
    </main>
  );
}
