import { ModulePlaceholder } from '@/shared/components/common/module-placeholder';
export function FeedbackPage() {
  return (
    <ModulePlaceholder
      title="Retroalimentación pedagógica"
      description="Un espacio para comprender brechas de aprendizaje y consultar recomendaciones. La generación de retroalimentación y la integración con modelos de IA se realizan en el backend."
    />
  );
}
export function PracticePage() {
  return (
    <ModulePlaceholder
      title="Práctica y refuerzo"
      description="Consulta actividades sugeridas y acompaña el progreso del aprendizaje. Los ejercicios se incorporarán a partir del contrato de AI Practice."
    />
  );
}
