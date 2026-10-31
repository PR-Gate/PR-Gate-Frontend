import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { Assessment, Participant } from '../../domain/assessment';
import { useTestActions } from '../hooks/use-assessments';
export function ResponseReview({
  test,
  participant,
  onClose,
}: {
  test: Assessment;
  participant: Participant;
  onClose(): void;
}) {
  const actions = useTestActions();
  const [scores, setScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      test.questions.map((question) => [
        question.id,
        String(
          participant.answers.find(
            (answer) => answer.questionId === question.id,
          )?.score ?? '',
        ),
      ]),
    ),
  );
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const save = async () => {
    if (
      test.questions.some(
        (q) =>
          scores[q.id] === '' ||
          !Number.isFinite(Number(scores[q.id])) ||
          Number(scores[q.id]) < 0 ||
          Number(scores[q.id]) > q.points,
      )
    ) {
      setError('Completa todos los puntajes dentro del rango indicado.');
      return;
    }
    try {
      await actions.review.mutateAsync({
        id: test.id,
        input: {
          participantId: participant.id,
          scores: Object.fromEntries(
            Object.entries(scores).map(([id, value]) => [id, Number(value)]),
          ),
          feedback,
        },
      });
      toast.success('Revisión docente guardada en la demostración');
      onClose();
    } catch {
      setError('No se pudo guardar la revisión. Inténtalo nuevamente.');
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !actions.review.isPending) onClose();
      }}
      title={`Respuesta de ${participant.name}`}
      description="La calificación final queda bajo tu control como docente."
    >
      <form
        className="assessment-form"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <p className="assessment-notice">
          Los puntajes de preguntas cerradas pueden ser sugerencias del servicio
          simulado. Revisa y confirma cada puntaje antes de guardar.
        </p>
        {test.questions.map((question, index) => {
          const answer = participant.answers.find(
            (answer) => answer.questionId === question.id,
          );
          const selected =
            question.kind === 'open'
              ? answer?.value
              : question.options[Number(answer?.value)];
          return (
            <fieldset key={question.id}>
              <legend>
                {index + 1}. {question.prompt}
              </legend>
              {question.kind === 'open' && (
                <p className="assessment-notice">Requiere revisión docente</p>
              )}
              <p className="test-answer">{selected || 'Sin respuesta'}</p>
              {question.kind !== 'open' && (
                <p className="test-subtle">
                  Respuesta de referencia:{' '}
                  {question.options[Number(question.correctAnswer)]}
                </p>
              )}
              <label>
                Puntaje de la pregunta {index + 1} (máximo {question.points})
                <input
                  type="number"
                  min="0"
                  max={question.points}
                  step="0.1"
                  value={scores[question.id] ?? ''}
                  onChange={(event) =>
                    setScores((values) => ({
                      ...values,
                      [question.id]: event.target.value,
                    }))
                  }
                  required
                  disabled={actions.review.isPending}
                />
              </label>
              {answer?.feedback && (
                <p className="test-subtle">
                  Revisión anterior: {answer.feedback}
                </p>
              )}
            </fieldset>
          );
        })}
        <label>
          Retroalimentación para el alumno
          <textarea
            maxLength={3000}
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            disabled={actions.review.isPending}
          />
        </label>
        {error && (
          <p role="alert" className="assessment-error">
            {error}
          </p>
        )}
        <div className="assessment-actions">
          <Button
            type="button"
            variant="outline"
            disabled={actions.review.isPending}
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button type="submit" disabled={actions.review.isPending}>
            {actions.review.isPending
              ? 'Guardando…'
              : 'Guardar revisión docente'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
