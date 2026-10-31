import { Construction } from 'lucide-react';
export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section>
      <p className="eyebrow">ESPACIO ACADÉMICO</p>
      <h1 className="page-title">{title}</h1>
      <div className="mt-8 rounded-xl border border-border bg-white p-10">
        <Construction className="mb-4 text-primary" size={30} />
        <h2 className="text-lg font-semibold">
          Un espacio para seguir creciendo
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{description}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          Módulo preparado. Su implementación requiere definir el contrato con
          el servicio backend.
        </p>
      </div>
    </section>
  );
}
