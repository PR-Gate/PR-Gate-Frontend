import { EmptyState } from '@/shared/components/feedback/async-state';
import type { ComponentProps } from 'react';
import { RubricCard } from './rubric-card';
export function RubricLibrary({
  rubrics,
  ...props
}: Omit<ComponentProps<typeof RubricCard>, 'rubric'> & {
  rubrics: ComponentProps<typeof RubricCard>['rubric'][];
}) {
  return rubrics.length ? (
    <div className="rubric-library">
      {rubrics.map((rubric) => (
        <RubricCard key={rubric.id} rubric={rubric} {...props} />
      ))}
    </div>
  ) : (
    <EmptyState
      title="No hay rúbricas para mostrar"
      description="Crea una rúbrica o cambia los filtros de búsqueda."
    />
  );
}
