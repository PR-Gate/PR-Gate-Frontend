import { ModulePlaceholder } from '@/shared/components/common/module-placeholder';
export function PipelinesPage() {
  return (
    <ModulePlaceholder
      title="Pipelines"
      description="Aquí podrás consultar ejecuciones, estados, logs y evidencias de CI/CD. El procesamiento de webhooks y la ejecución pertenecen al backend."
    />
  );
}
export function QualityGatesPage() {
  return (
    <ModulePlaceholder
      title="Quality Gates"
      description="Consulta los resultados de las reglas técnicas calculadas por el servicio de auditoría. El frontend no evalúa el código ni determina calificaciones."
    />
  );
}
