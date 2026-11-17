import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { StudentResultPage } from './student-result.page';

it('shows pending results without a query provider, fabricated criteria or enabled evidence actions', () => {
  render(<StudentResultPage />);
  expect(screen.getByRole('heading', { name: 'Mi rúbrica' })).toBeInTheDocument();
  expect(screen.getByText('Resultado pendiente')).toBeInTheDocument();
  expect(screen.getByText('Escala pendiente de información')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Criterios de evaluación' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Ver evidencia completa' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Ver cómo mejorar' })).toHaveAccessibleDescription();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
