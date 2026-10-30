import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useCreateProject } from '../hooks/use-create-project';
import {
  projectFormSchema,
  type ProjectFormValues,
} from '../schemas/project.schema';
export function ProjectForm({ onSuccess }: { onSuccess(): void }) {
  const mutation = useCreateProject();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { name: '', description: '', course: '', repositoryUrl: '' },
  });
  const submit = async (values: ProjectFormValues) => {
    try {
      await mutation.mutateAsync(values);
      toast.success('Proyecto creado');
      onSuccess();
    } catch {
      /* Render the mutation error inline. */
    }
  };
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {(
        [
          {
            name: 'name',
            label: 'Nombre del proyecto',
            placeholder: 'Ej. Plataforma de biblioteca',
          },
          {
            name: 'course',
            label: 'Curso',
            placeholder: 'Ej. Ingeniería de Software II',
          },
          {
            name: 'description',
            label: 'Descripción',
            placeholder: '¿Qué construirá tu equipo?',
          },
          {
            name: 'repositoryUrl',
            label: 'Repositorio HTTPS (opcional)',
            placeholder: 'https://github.com/organizacion/proyecto',
          },
        ] as const
      ).map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="mb-1.5 block text-sm font-medium"
          >
            {field.label}
          </label>
          {field.name === 'description' ? (
            <textarea
              id={field.name}
              className="input min-h-24"
              {...register(field.name)}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
              placeholder={field.placeholder}
            />
          ) : (
            <input
              id={field.name}
              className="input"
              {...register(field.name)}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
              placeholder={field.placeholder}
            />
          )}
          {errors[field.name] && (
            <p id={`${field.name}-error`} className="mt-1 text-sm text-red-700">
              {errors[field.name]?.message}
            </p>
          )}
        </div>
      ))}
      {mutation.isError && (
        <p role="alert" className="text-sm text-red-700">
          {mutation.error.message}
        </p>
      )}
      <Button
        className="mt-2 w-full"
        disabled={mutation.isPending}
        type="submit"
      >
        {mutation.isPending ? 'Creando…' : 'Crear proyecto'}
      </Button>
    </form>
  );
}
