import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { AuthContext } from '@/shared/services/auth/auth-context';
import { CompleteProfileForm } from './complete-profile-form';

it('submits an explicit teacher choice to the profile operation', async () => {
  const completeProfile = vi.fn(async () => {});
  render(
    <AuthContext.Provider
      value={{
        user: null,
        loading: false,
        error: null,
        login: async () => {},
        logout: async () => {},
        completeProfile,
      }}
    >
      <CompleteProfileForm />
    </AuthContext.Provider>,
  );
  await userEvent.click(screen.getByRole('radio', { name: 'Docente' }));
  await userEvent.click(
    screen.getByRole('button', { name: 'Guardar perfil y continuar' }),
  );
  expect(completeProfile).toHaveBeenCalledWith('teacher');
});
