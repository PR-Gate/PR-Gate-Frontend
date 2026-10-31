import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import type { Question } from '../../domain/assessment';
import { questionFormSchema } from '../schemas/test.schema';
interface Values {
  prompt: string;
  points: number;
  feedback: string;
}
export function QuestionEditor({
  question,
  onSave,
  onClose,
}: {
  question: Question | null;
  onSave(question: Question): void;
  onClose(): void;
}) {
  const [kind, setKind] = useState<Question['kind']>(
    question?.kind ?? 'multiple',
  );
  const [options, setOptions] = useState(
    question?.options.length ? question.options : ['', ''],
  );
  const [correct, setCorrect] = useState(question?.correctAnswer ?? '');
  const [optionError, setOptionError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      prompt: question?.prompt ?? '',
      points: question?.points ?? 1,
      feedback: question?.feedback ?? '',
    },
  });
  const submit = (values: Values) => {
    const answers = kind === 'boolean' ? ['Verdadero', 'Falso'] : options;
    if (
      kind !== 'open' &&
      (answers.some((value) => !value.trim()) ||
        !answers[Number(correct)] ||
        correct === '')
    ) {
      setOptionError('Completa las opciones y elige la respuesta correcta.');
      return;
    }
    onSave({
      id: question?.id ?? crypto.randomUUID(),
      kind,
      ...values,
      options: kind === 'open' ? [] : answers.map((value) => value.trim()),
      correctAnswer: kind === 'open' ? '' : correct,
    });
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={question ? 'Editar pregunta' : 'Crear pregunta'}
      description="Define qué responderán los alumnos y cuántos puntos vale."
    >
      <form
        className="assessment-form"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <label>
          Tipo de pregunta
          <select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as Question['kind']);
              setCorrect('');
              setOptionError('');
            }}
          >
            <option value="multiple">Selección múltiple</option>
            <option value="boolean">Verdadero o falso</option>
            <option value="open">Respuesta abierta</option>
          </select>
        </label>
        <label>
          Enunciado
          <textarea
            {...register('prompt')}
            aria-invalid={Boolean(errors.prompt)}
          />
        </label>
        {errors.prompt && <p role="alert">{errors.prompt.message}</p>}
        {kind !== 'open' && (
          <fieldset>
            <legend>Opciones y respuesta correcta</legend>
            {(kind === 'boolean' ? ['Verdadero', 'Falso'] : options).map(
              (option, index) => (
                <div className="question-option" key={index}>
                  <input
                    type="radio"
                    name="correct-answer"
                    aria-label={`Marcar opción ${index + 1} como correcta`}
                    checked={correct === String(index)}
                    onChange={() => setCorrect(String(index))}
                  />
                  {kind === 'boolean' ? (
                    <span>{option}</span>
                  ) : (
                    <input
                      value={option}
                      aria-label={`Opción ${index + 1}`}
                      onChange={(event) =>
                        setOptions((values) =>
                          values.map((value, position) =>
                            position === index ? event.target.value : value,
                          ),
                        )
                      }
                    />
                  )}
                  {kind === 'multiple' && options.length > 2 && (
                    <button
                      type="button"
                      aria-label={`Eliminar opción ${index + 1}`}
                      onClick={() => {
                        setOptions((values) =>
                          values.filter((_, position) => position !== index),
                        );
                        setCorrect('');
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ),
            )}
            {kind === 'multiple' && options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOptions((values) => [...values, ''])}
              >
                Agregar opción
              </Button>
            )}
          </fieldset>
        )}
        {kind === 'open' && (
          <p className="assessment-notice">
            Requiere revisión docente. No se asignará una calificación final
            automática.
          </p>
        )}
        {optionError && <p role="alert">{optionError}</p>}
        <label>
          Puntaje
          <input
            type="number"
            min="0.5"
            step="0.5"
            max="100"
            {...register('points', { valueAsNumber: true })}
          />
        </label>
        {errors.points && <p role="alert">{errors.points.message}</p>}
        <label>
          Retroalimentación — opcional
          <textarea {...register('feedback')} />
        </label>
        {errors.feedback && <p role="alert">{errors.feedback.message}</p>}
        <div className="assessment-actions">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar pregunta</Button>
        </div>
      </form>
    </Dialog>
  );
}
