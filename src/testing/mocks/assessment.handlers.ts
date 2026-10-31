import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';
import {
  draftDtoSchema,
  type AssessmentDto,
} from '@/features/assessments/infrastructure/assessment.dto';
import { createAssessmentFixtures, testCatalog } from './assessment.fixtures';
export function createAssessmentHandlers(
  baseUrl = 'http://localhost/api',
  latency = 0,
) {
  const root = `${baseUrl.replace(/\/$/, '')}/demo/assessments`;
  const tests = createAssessmentFixtures();
  const reminders: { testId: string; recipients: string[] }[] = [];
  const fail = (message: string, status = 422) =>
    HttpResponse.json({ message }, { status });
  function synchronize(test: AssessmentDto) {
    if (test.status !== 'draft')
      test.status =
        Date.parse(test.closesAt) <= Date.now()
          ? 'finished'
          : Date.parse(test.opensAt) > Date.now()
            ? 'scheduled'
            : 'published';
  }
  const find = (id: unknown) => {
    const test = tests.find((test) => test.id === id);
    if (test) synchronize(test);
    return test;
  };
  const selectedStudents = (input: z.infer<typeof draftDtoSchema>) => {
    const course = testCatalog.courses.find(
      (course) => course.id === input.courseId,
    );
    return (
      course?.students.filter(
        (student) =>
          input.assignment.mode === 'all' ||
          input.assignment.ids.includes(
            input.assignment.mode === 'teams' ? student.teamId : student.id,
          ),
      ) ?? []
    );
  };
  function recalculate(test: AssessmentDto) {
    test.assigned_count = test.participants.length;
    test.responded_count = test.participants.filter((p) =>
      ['submitted', 'needs_review', 'graded'].includes(p.status),
    ).length;
    test.pending_responses = test.assigned_count - test.responded_count;
    test.pending_review = test.participants.filter((p) =>
      ['submitted', 'needs_review'].includes(p.status),
    ).length;
    const graded = test.participants.filter(
      (p) => p.status === 'graded' && p.score !== null,
    );
    test.results.average = graded.length
      ? graded.reduce((sum, p) => sum + p.score!, 0) / graded.length
      : null;
    test.results.participation = test.assigned_count
      ? (test.responded_count / test.assigned_count) * 100
      : 0;
    test.results.distribution = [
      {
        label: 'Calificaciones confirmadas por el docente',
        count: graded.length,
      },
      {
        label: 'Respuestas pendientes de revisión',
        count: test.pending_review,
      },
    ];
  }
  return [
    http.get(`${root}/catalog`, async () => {
      await delay(latency);
      return HttpResponse.json(testCatalog);
    }),
    http.get(root, async () => {
      await delay(latency);
      tests.forEach(synchronize);
      return HttpResponse.json({
        data: tests,
        summary: {
          published: tests.filter((t) => t.status === 'published').length,
          pending_responses: tests
            .filter((t) => t.status === 'published')
            .reduce((n, t) => n + t.pending_responses, 0),
          pending_review: tests.reduce((n, t) => n + t.pending_review, 0),
        },
      });
    }),
    http.get(`${root}/:id`, async ({ params }) => {
      await delay(latency);
      const test = find(params.id);
      return test ? HttpResponse.json(test) : fail('Test no encontrado', 404);
    }),
    ...[root, `${root}/:id/draft`].map((path) =>
      http.post(path, async ({ request, params }) => {
        await delay(latency);
        const parsed = draftDtoSchema.safeParse(await request.json());
        if (!parsed.success) return fail('Datos incompletos');
        const input = parsed.data;
        const course = testCatalog.courses.find(
          (course) => course.id === input.courseId,
        );
        if (!course) return fail('Curso inválido');
        const existing = params.id ? find(params.id) : undefined;
        if (params.id && !existing) return fail('Test no encontrado', 404);
        if (existing && !['draft', 'scheduled'].includes(existing.status))
          return fail('Este test ya no puede editarse', 409);
        const students = selectedStudents(input);
        const result: AssessmentDto = {
          ...input,
          id: existing?.id ?? crypto.randomUUID(),
          course_name: course.name,
          section: course.section,
          status: 'draft',
          assigned_count: students.length,
          responded_count: 0,
          pending_responses: students.length,
          pending_review: 0,
          total_points: input.questions.reduce((n, q) => n + q.points, 0),
          participants: students.map((s) => ({
            id: s.id,
            name: s.name,
            status: 'not_started',
            submittedAt: null,
            score: null,
            answers: [],
          })),
          results: {
            average: null,
            participation: 0,
            difficultQuestions: [],
            distribution: [],
            support: [],
          },
        };
        if (existing) tests.splice(tests.indexOf(existing), 1, result);
        else tests.unshift(result);
        return HttpResponse.json(result, { status: existing ? 200 : 201 });
      }),
    ),
    http.post(`${root}/:id/publish`, async ({ params }) => {
      await delay(latency);
      const test = find(params.id);
      if (!test) return fail('Test no encontrado', 404);
      if (test.status !== 'draft')
        return fail('Guarda los cambios como borrador antes de publicar', 409);
      if (
        !test.questions.length ||
        !test.assigned_count ||
        !Number.isFinite(Date.parse(test.opensAt)) ||
        !Number.isFinite(Date.parse(test.closesAt)) ||
        Date.parse(test.closesAt) <=
          Math.max(Date.parse(test.opensAt), Date.now())
      )
        return fail('Revisa preguntas, alumnos y fechas');
      for (const q of test.questions) {
        if (
          q.kind !== 'open' &&
          (q.correctAnswer === '' ||
            !Number.isInteger(Number(q.correctAnswer)) ||
            q.options.length < 2 ||
            q.options.some((option) => !option.trim()) ||
            !q.options[Number(q.correctAnswer)])
        )
          return fail('Revisa las respuestas correctas');
      }
      test.status =
        Date.parse(test.opensAt) > Date.now() ? 'scheduled' : 'published';
      return HttpResponse.json(test);
    }),
    http.post(`${root}/:id/reminders`, async ({ params, request }) => {
      await delay(latency);
      const test = find(params.id);
      if (!test) return fail('Test no encontrado', 404);
      if (test.status !== 'published')
        return fail('Solo se puede recordar un test publicado', 409);
      const parsed = z
        .object({ participantId: z.string().optional() })
        .safeParse(await request.json());
      if (!parsed.success) return fail('Destinatario inválido');
      const recipients = test.participants
        .filter(
          (p) =>
            ['not_started', 'in_progress'].includes(p.status) &&
            (!parsed.data.participantId || p.id === parsed.data.participantId),
        )
        .map((p) => p.id);
      if (!recipients.length)
        return fail('No hay alumnos pendientes para este recordatorio', 409);
      reminders.push({ testId: test.id, recipients });
      return HttpResponse.json({ recipients: recipients.length });
    }),
    http.post(`${root}/:id/reviews`, async ({ params, request }) => {
      await delay(latency);
      const test = find(params.id);
      if (!test) return fail('Test no encontrado', 404);
      const parsed = z
        .object({
          participantId: z.string(),
          scores: z.record(z.string(), z.number().nonnegative()),
          feedback: z.string().max(3000),
        })
        .safeParse(await request.json());
      if (!parsed.success) return fail('Revisión inválida');
      const p = test.participants.find(
        (p) => p.id === parsed.data.participantId,
      );
      if (!p || !['needs_review', 'submitted', 'graded'].includes(p.status))
        return fail('No hay una entrega disponible', 409);
      for (const q of test.questions)
        if (
          parsed.data.scores[q.id] === undefined ||
          parsed.data.scores[q.id]! > q.points
        )
          return fail('Revisa los puntajes');
      p.score = test.questions.reduce(
        (n, q) => n + parsed.data.scores[q.id]!,
        0,
      );
      p.status = 'graded';
      p.answers = test.questions.map((q) => ({
        questionId: q.id,
        value:
          p.answers.find((answer) => answer.questionId === q.id)?.value ?? '',
        score: parsed.data.scores[q.id]!,
        feedback: parsed.data.feedback,
      }));
      recalculate(test);
      return HttpResponse.json(test);
    }),
  ];
}
