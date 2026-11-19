import { Info } from 'lucide-react';
export function ModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="space-y-6">
      <h1 className="page-title">{title}</h1>
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
        <Info className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
