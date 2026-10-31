import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';
import {
  publicationIssues,
  rubricTotal,
} from '@/features/rubrics/domain/rubric';
import {
  rubricDraftSchema,
  type RubricDto,
} from '@/features/rubrics/infrastructure/rubric.dto';
import {
  createRubricFixtures,
  createStudentRubricFixture,
  rubricCourses,
  rubricCriteria,
} from './rubric.fixtures';
export function createRubricHandlers(
  baseUrl = 'http://localhost/api',
  latency = 0,
) {
  const root = `${baseUrl.replace(/\/$/, '')}/demo/rubrics`;
  const rubrics = createRubricFixtures();
  // Immutable assigned version: authoring edits never recalculate a student's result.
  const assigned = createStudentRubricFixture();
  const fail = (message: string, status = 422) =>
    HttpResponse.json({ message }, { status });
  return [
    http.get(root, async () => {
      await delay(latency);
      return HttpResponse.json({ data: rubrics, courses: rubricCourses });
    }),
    http.get(`${root}/assigned`, async () => {
      await delay(latency);
      return HttpResponse.json(assigned);
    }),
    http.post(`${root}/import-preview`, async ({ request }) => {
      await delay(latency + 200);
      const parsed = z
        .object({
          name: z.string().regex(/\.(pdf|doc|docx|xls|xlsx)$/i),
          size: z
            .number()
            .positive()
            .max(10 * 1024 * 1024),
          type: z.string(),
        })
        .safeParse(await request.json());
      if (!parsed.success) return fail('Archivo no permitido');
      return HttpResponse.json({
        name: parsed.data.name.replace(/\.[^.]+$/, ''),
        description:
          'Criterios de ejemplo para revisar. No se ha leído ni extraído el contenido del documento.',
        courseId: '',
        sectionId: '',
        expectedScore: 20,
        version: '1.0',
        criteria: rubricCriteria().map((criterion) => ({
          ...criterion,
          id: crypto.randomUUID(),
          levels: criterion.levels.map((level) => ({
            ...level,
            id: crypto.randomUUID(),
          })),
        })),
      });
    }),
    ...[root, `${root}/:id/draft`].map((path) =>
      http.post(path, async ({ request, params }) => {
        await delay(latency);
        const parsed = rubricDraftSchema.safeParse(await request.json());
        if (!parsed.success) return fail('Revisa los datos de la rúbrica');
        const existing = params.id
          ? rubrics.find((rubric) => rubric.id === params.id)
          : undefined;
        if (params.id && !existing) return fail('Rúbrica no encontrada', 404);
        if (existing && existing.status !== 'draft')
          return fail('Crea una nueva versión para editar esta rúbrica', 409);
        const rubric: RubricDto = {
          ...parsed.data,
          id: existing?.id ?? crypto.randomUUID(),
          status: 'draft',
          total_score: rubricTotal(parsed.data.criteria),
          updated_at: new Date().toISOString(),
        };
        if (existing) rubrics.splice(rubrics.indexOf(existing), 1, rubric);
        else rubrics.unshift(rubric);
        return HttpResponse.json(rubric, { status: existing ? 200 : 201 });
      }),
    ),
    ...(['publish', 'duplicate', 'archive', 'delete'] as const).map((action) =>
      http.post(`${root}/:id/${action}`, async ({ params }) => {
        await delay(latency);
        const rubric = rubrics.find((rubric) => rubric.id === params.id);
        if (!rubric) return fail('Rúbrica no encontrada', 404);
        if (action === 'delete') {
          rubrics.splice(rubrics.indexOf(rubric), 1);
          return HttpResponse.json({ removed: true });
        }
        if (action === 'duplicate') {
          const copy: RubricDto = {
            ...structuredClone(rubric),
            id: crypto.randomUUID(),
            name: `${rubric.name || 'Sin nombre'} (copia)`,
            status: 'draft',
            version: '1.0',
            updated_at: new Date().toISOString(),
            criteria: rubric.criteria.map((criterion) => ({
              ...structuredClone(criterion),
              id: crypto.randomUUID(),
              levels: criterion.levels.map((level) => ({
                ...level,
                id: crypto.randomUUID(),
              })),
            })),
          };
          rubrics.unshift(copy);
          return HttpResponse.json(copy, { status: 201 });
        }
        if (action === 'publish') {
          const course = rubricCourses.find(
            (course) => course.id === rubric.courseId,
          );
          if (rubric.status !== 'draft')
            return fail('Solo se publican borradores', 409);
          if (
            !course ||
            !course.sections.some(
              (section) => section.id === rubric.sectionId,
            ) ||
            course.expectedScore !== rubric.expectedScore ||
            publicationIssues(rubric).length
          )
            return fail('La rúbrica aún no está lista para publicarse');
          rubric.status = 'published';
        } else rubric.status = 'archived';
        rubric.updated_at = new Date().toISOString();
        return HttpResponse.json(rubric);
      }),
    ),
  ];
}
