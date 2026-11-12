import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import { AuthContext } from '@/shared/services/auth/auth-context';
import { GitHubLinkContext } from '../hooks/use-github-link';
import { GitHubLinkCard } from './github-link-card';
import {
  GetGitHubLinkUseCase,
  AuthorizeGitHubLinkUseCase,
} from '../../application/use-cases/github-link.use-cases';

function setup({
  pending = false,
  demo = false,
  linked = false,
  failure = false,
} = {}) {
  const get = vi.fn().mockImplementation(async () => {
    if (failure) throw new Error('backend unavailable');
    return linked ? { login: 'ana', linkedAt: '2026-11-11T12:00:00Z' } : null;
  });
  const authorize = vi.fn().mockResolvedValue({
    authorizationUrl: 'https://github.com/login/oauth/authorize?client_id=test',
    expiresAt: new Date(Date.now() + 600_000).toISOString(),
  });
  const login = vi.fn(async () => {});
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <AuthContext.Provider
        value={{
          user: {
            id: 'student',
            name: 'Ana',
            email: '',
            roles: pending ? [] : ['STUDENT'],
            academicProfilePending: pending,
          },
          loading: false,
          error: null,
          login,
          logout: async () => {},
        }}
      >
        <GitHubLinkContext.Provider
          value={{
            get: new GetGitHubLinkUseCase({ get, authorize }),
            authorize: new AuthorizeGitHubLinkUseCase({ get, authorize }),
          }}
        >
          <GitHubLinkCard demo={demo} />
        </GitHubLinkContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
  return { get, authorize, login };
}

it.each([{ pending: true }, { demo: true }])(
  'blocks requests when the session is not ready: %o',
  (options) => {
    const { get } = setup(options);
    expect(
      screen.getByRole('button', { name: 'Vincular cuenta de GitHub' }),
    ).toBeDisabled();
    expect(get).not.toHaveBeenCalled();
  },
);

it('shows the linked account only after querying the backend', async () => {
  setup({ linked: true });
  expect(await screen.findByText(/Cuenta vinculada: @ana/)).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Renovar autorización de GitHub' }),
  ).toBeEnabled();
});

it('opens authorization and lets the student refresh the authoritative status', async () => {
  const { get, authorize, login } = setup();
  const replace = vi.fn();
  const popup = { opener: {}, location: { replace }, close: vi.fn() };
  const open = vi
    .spyOn(window, 'open')
    .mockReturnValue(popup as unknown as Window);
  try {
    await screen.findByText(/Sin cuenta vinculada/);
    await userEvent.click(
      screen.getByRole('button', { name: 'Vincular cuenta de GitHub' }),
    );
    expect(authorize).toHaveBeenCalledOnce();
    expect(login).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith(
      'https://github.com/login/oauth/authorize?client_id=test',
    );
    expect(popup.opener).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Actualizar estado' }),
    );
    expect(get).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/Cuenta vinculada:/)).not.toBeInTheDocument();
  } finally {
    open.mockRestore();
  }
});

it('shows backend errors with a retry action', async () => {
  setup({ failure: true });
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'No se pudo consultar GitHub',
  );
  expect(
    screen.getByRole('button', { name: 'Actualizar estado' }),
  ).toBeEnabled();
});
