import { z } from 'zod';
export const testBasicsSchema = z.object({
  title: z.string().trim().min(3, 'Escribe al menos 3 caracteres').max(150),
  courseId: z.string().min(1, 'Elige un curso'),
  durationMinutes: z
    .number()
    .int()
    .min(1, 'Indica al menos 1 minuto')
    .max(300, 'Máximo 300 minutos'),
  instructions: z.string().max(3000),
});
export const questionFormSchema = z.object({
  prompt: z.string().trim().min(5, 'Escribe al menos 5 caracteres'),
  points: z.number().min(0.5, 'El puntaje debe ser mayor que cero').max(100),
  feedback: z.string().max(2000),
});
export function limaInput(iso: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '';
  return new Date(date.getTime() - 5 * 3600000).toISOString().slice(0, 16);
}
export function limaIso(input: string) {
  return input ? new Date(`${input}:00-05:00`).toISOString() : '';
}
