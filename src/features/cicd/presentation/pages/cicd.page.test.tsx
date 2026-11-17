import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it } from 'vitest';
import { PipelinesPage, QualityGatesPage } from './cicd.page';

it('shows pending pipeline stages and links to the same project quality gate', () => {
  render(
    <MemoryRouter initialEntries={['/projects/project-a/pipelines']}>
      <Routes>
        <Route
          path="/projects/:projectId/pipelines"
          element={<PipelinesPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getAllByText('Sin información')).toHaveLength(6);
  expect(
    screen.getByRole('link', { name: 'Ver resultado del Quality Gate' }),
  ).toHaveAttribute('href', '/quality-gate?projectId=project-a');
  expect(
    screen.getByRole('button', { name: 'Ver detalles de Tests' }),
  ).toBeDisabled();
});
it('does not invent gate results, metric values or thresholds', () => {
  render(
    <MemoryRouter initialEntries={['/projects/project-a/quality-gates']}>
      <Routes>
        <Route
          path="/projects/:projectId/quality-gates"
          element={<QualityGatesPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    screen.getByRole('heading', { name: 'Resultado pendiente' }),
  ).toBeInTheDocument();
  expect(screen.getAllByText('Sin evaluar')).toHaveLength(4);
  expect(
    screen.getByRole('button', { name: 'Ver cómo corregir' }),
  ).toBeDisabled();
  expect(
    screen.getByRole('link', { name: 'Volver a la ejecución' }),
  ).toHaveAttribute('href', '/pipelines?projectId=project-a');
  expect(screen.queryByText(/no aprobado/i)).not.toBeInTheDocument();
});
